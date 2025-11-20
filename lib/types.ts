import { Timestamp } from "firebase/firestore"

// Type untuk Module
export interface Module {
  id: string
  title: string
  description: string
  content: string
  createdAt: Timestamp | Date
}

// Type untuk Exam
export interface Exam {
  id: string
  moduleId: string
  question: string
  keyAnswer: string
  maxScore: number
}

// Type untuk Event Category
export interface EventCategory {
  id: string
  name: string
  slug: string
}

// Type untuk Event
export interface Event {
  id: string
  title: string
  description: string
  categoryId: string
  startDate: Timestamp | Date
  endDate: Timestamp | Date
  registrationLink: string
}

