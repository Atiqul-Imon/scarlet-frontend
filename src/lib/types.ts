export interface Category { _id?: string; name: string; slug: string; parentId?: string | null }
export interface Product { _id?: string; title: string; slug: string; images: string[]; price: { currency: string; amount: number } }


