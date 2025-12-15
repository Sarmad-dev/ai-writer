import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { ChartTypes, Sandbox } from "@e2b/code-interpreter";
import { EChartsOption } from "echarts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Convert E2B chart format to ECharts format
 */
function convertToECharts(chart: ChartTypes) {
  try {
    const { type, title, elements } = chart;
    // Handle x_label and y_label safely as they might not exist on the type
    const x_label = (chart as any).x_label;
    const y_label = (chart as any).y_label;

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      console.warn("Invalid or empty elements array:", elements);
      return null;
    }

    // Extract data from elements - handle both formats
    // Format 1: { label, value } - legacy format
    // Format 2: { name, points } - new sandbox format
    const seriesData = elements.map((el: any) => {
      let data;
      
      if (el.points && Array.isArray(el.points)) {
        // New format with points array
        data = el.points.map((p: [number, number]) => [p[0], p[1]]);
      } else if (el.value !== undefined) {
        // Legacy format with single value
        data = [el.value];
      } else {
        // Fallback
        data = [0];
      }
      
      return {
        name: el.label || el.name || 'Series',
        data: data,
      };
    });

    // Validate that we have valid data
    // const validSeriesData = seriesData.filter(item =>
    //   item.name !== undefined &&
    //   item.value !== undefined &&
    //   !isNaN(Number(item.value))
    // );

    // if (validSeriesData.length === 0) {
    //   console.warn("No valid series data found after processing:", seriesData);
    //   return null;
    // }

    // Create ECharts configuration based on chart type
    let echartsConfig: EChartsOption = {
      title: {
        text: title || "Chart",
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "transparent",
        textStyle: {
          color: "#fff",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
    };

    if (type === "bar") {
      echartsConfig.xAxis = {
        type: "category",
        name: x_label || "",
        nameLocation: "middle",
        nameGap: 30,
      };
      echartsConfig.yAxis = {
        type: "value",
        name: y_label || "",
        nameLocation: "middle",
        nameGap: 50,
      };
      echartsConfig.series = seriesData.map(series => ({
        ...series,
        type: "bar",
        itemStyle: {
          color: "#3b82f6",
        },
        emphasis: {
          itemStyle: {
            color: "#1d4ed8",
          },
        },
      }));
    } else if (type === "line") {
      echartsConfig.xAxis = {
        type: "category",
        name: x_label || "",
      };
      echartsConfig.yAxis = {
        type: "value",
        name: y_label || "",
      };
      echartsConfig.series = seriesData.map(series => ({
        ...series,
        type: "line",
        lineStyle: {
          color: "#3b82f6",
        },
        itemStyle: {
          color: "#3b82f6",
        },
      }));
    } else if (type === "pie") {
      echartsConfig.series = seriesData.map(series => ({
        ...series,
        type: "pie",
        radius: "50%",
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      }));
    }

    return echartsConfig;
  } catch (error) {
    console.error("Error converting chart data:", error);
    return null;
  }
}

/**
 * POST /api/charts/execute
 * Execute Python code in E2B sandbox and return chart images
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Python code is required" },
        { status: 400 }
      );
    }

    // Check if E2B API key is configured
    if (!process.env.E2B_API_KEY) {
      return NextResponse.json(
        { error: "E2B API key not configured" },
        { status: 500 }
      );
    }

    let sandbox: Sandbox | null = null;

    try {
      // Create E2B sandbox
      sandbox = await Sandbox.create({
        apiKey: process.env.E2B_API_KEY,
      });

      // Execute the Python code
      const execution = await sandbox.runCode(code);

      // Check for errors
      if (execution.error) {
        return NextResponse.json({
          success: false,
          error: execution.error.name + ": " + execution.error.value,
          traceback: execution.error.traceback,
        });
      }

      // Get any generated images/plots
      const images: string[] = [];
      const charts: any[] = [];

      if (execution.results) {
        for (const result of execution.results) {
          // Check if result has image data
          if (result.png) {
            // Convert base64 image to data URL
            const imageData = `data:image/png;base64,${result.png}`;
            images.push(imageData);
          }

          // Check if result has chart data
          if (result.chart) {
            const chart = result.chart;

            const echartsData = convertToECharts(chart);

            if (echartsData) {
              charts.push(echartsData);
            } else {
              console.log("Failed to convert chart data");
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        output: execution.text || "",
        images,
        interactiveData: charts.length > 0 ? charts[0] : null, // Use first chart for now
        logs: execution.logs || [],
      });
    } finally {
      // Always kill the sandbox
      if (sandbox) {
        await sandbox.kill();
      }
    }
  } catch (error) {
    console.error("E2B execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
