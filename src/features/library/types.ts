export type BookCopyStatus = 'AVAILABLE' | 'BORROWED' | 'LOST' | 'DAMAGED' | 'RETIRED'
export type LoanStatus = 'ONGOING' | 'RETURNED' | 'OVERDUE' | 'LOST'

export interface BookCopy {
  id: number
  bookId: number
  inventoryCode: string
  status: BookCopyStatus
}

export interface Book {
  id: number
  establishmentId: number
  isbn: string | null
  title: string
  author: string | null
  publisher: string | null
  category: string | null
  publishedYear: number | null
  createdAt: string
  updatedAt: string
  copies: BookCopy[]
  _count: { copies: number }
}

export interface Loan {
  id: number
  bookCopyId: number
  studentId: number | null
  teacherId: number | null
  loanDate: string
  dueDate: string
  returnDate: string | null
  status: LoanStatus
  bookCopy: {
    id: number
    inventoryCode: string
    status: BookCopyStatus
    book: { id: number; title: string; author: string | null }
  }
  student: { id: number; firstName: string; lastName: string; studentNumber: string } | null
  teacher: { id: number; firstName: string; lastName: string; employeeNumber: string } | null
}

export interface LoanFilters {
  status?: LoanStatus
  studentId?: number
  teacherId?: number
}

export interface CreateBookRequest {
  title: string
  isbn?: string | null
  author?: string | null
  publisher?: string | null
  category?: string | null
  publishedYear?: number | null
  /** Exemplaires créés d'emblée, avec des codes d'inventaire dérivés. */
  copies?: number
}

export interface UpdateBookRequest extends Partial<Omit<CreateBookRequest, 'copies'>> {
  id: number
}

export interface CreateLoanRequest {
  bookCopyId: number
  studentId?: number
  teacherId?: number
  dueDate: string
}
