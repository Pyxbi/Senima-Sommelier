import Image from "next/image"

export function ChatHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Image 
              src="/sentient.png" 
              alt="Cinema Sommelier Logo" 
              width={34} 
              height={34} 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Sentnema Sommelier</h1>
            <p className="text-sm text-muted-foreground">Your AI movie pairing expert</p>
          </div>
        </div>
      </div>
    </header>
  )
}
