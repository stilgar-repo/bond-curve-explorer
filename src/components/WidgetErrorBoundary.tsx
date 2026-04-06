import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  title: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WidgetErrorBoundary:${this.props.title}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-destructive" role="alert">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          <p className="text-caption font-semibold">{this.props.title} failed to render</p>
          <p className="text-caption text-muted-foreground max-w-[300px] text-center">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
