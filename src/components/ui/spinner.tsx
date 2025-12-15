import { Loader2 } from "lucide-react";
import React from "react";

type Props = {
  text?: string;
};

const Spinner = ({ text }: Props) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="animate-spin" />
      <span>{text}</span>
    </div>
  );
};

export default Spinner;
