export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          <span className="text-sm text-muted-foreground ml-2">Curating your perfect film pairing...</span>
        </div>
      </div>
    </div>
  )
}
