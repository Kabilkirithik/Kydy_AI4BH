import { createContext, useContext, useState, ReactNode } from 'react'

interface VisualizerContextType {
  svgContent:    string | null
  svgLoading:    boolean
  svgTopic:      string
  svgError:      string
  setSvgContent: (svg: string | null) => void
  setSvgLoading: (v: boolean) => void
  setSvgTopic:   (t: string) => void
  setSvgError:   (e: string) => void
}

const VisualizerContext = createContext<VisualizerContextType>({
  svgContent:    null,
  svgLoading:    false,
  svgTopic:      '',
  svgError:      '',
  setSvgContent: () => {},
  setSvgLoading: () => {},
  setSvgTopic:   () => {},
  setSvgError:   () => {},
})

export function VisualizerProvider({ children }: { children: ReactNode }) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [svgLoading, setSvgLoading] = useState(false)
  const [svgTopic,   setSvgTopic]   = useState('')
  const [svgError,   setSvgError]   = useState('')

  return (
    <VisualizerContext.Provider value={{
      svgContent, svgLoading, svgTopic, svgError,
      setSvgContent, setSvgLoading, setSvgTopic, setSvgError,
    }}>
      {children}
    </VisualizerContext.Provider>
  )
}

export const useVisualizer = () => useContext(VisualizerContext)