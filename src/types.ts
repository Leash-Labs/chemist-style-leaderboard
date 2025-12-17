export type Confusion = { name: string; count: number; chemist_id?: number }
export type PaperRef = { id?: string; chembl_doc_id?: string; title?: string; year?: number; url?: string }
export type Example = { image?: string; smiles?: string; caption?: string }

export type HeatmapData = {
  names: string[]
  matrix: number[][]
}

export type ChemistRow = {
  chemist_id: number
  name: string
  n_molecules: number
  n_papers?: number
  style_score: number
  acc1: number
  top5: number
  top10: number
  logloss_bits: number
  style_bits: number
  confusions_top1: Confusion[]
  papers?: PaperRef[]
  examples?: string[]  // Changed from Example[] to string[] (image paths)
  heatmap?: HeatmapData
}

export type LeaderboardData = ChemistRow[]
