"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-card/20 rounded-2xl border border-destructive/20">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <Warning size={48} className="text-destructive" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Maaf, halaman ini mengalami kendala teknis. Silakan coba segarkan halaman atau hubungi administrator jika masalah berlanjut.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <ArrowClockwise /> Segarkan Halaman
            </Button>
            <Button
              onClick={() => this.setState({ hasError: false })}
            >
              Coba Lagi
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 text-left bg-black/5 p-4 rounded-lg overflow-auto max-w-full">
              <p className="text-xs font-mono text-destructive">{this.state.error?.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
