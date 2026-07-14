import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Book {
  id?: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  pages: number;
  coverImage: string;
  pdfFileName: string;
  description: string;
  readingProgress?: number;
  isFavorite?: boolean;
}

export interface Video {
  id?: string;
  title: string;
  youtubeId: string;
  category: string;
  description: string;
  type: "Short" | "Long";
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  duration: string;
  rating: number;
  image: string;
  type?: "English" | "Science" | "General";
}

export interface Documentary {
  id?: string;
  title: string;
  youtubeID: string;
  duration: string;
  description: string;
  transcript: string;
}

export interface VocabularyWord {
  id?: string;
  english: string;
  sinhala: string;
  category: string;
  difficulty: number;
}

export interface AppUser {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [booksSnap, videosSnap, coursesSnap, docsSnap, vocabSnap, usersSnap] =
    await Promise.all([
      getCountFromServer(collection(db, "booklist")),
      getCountFromServer(collection(db, "video_list")),
      getCountFromServer(collection(db, "courses")),
      getCountFromServer(collection(db, "documentary_videos")),
      getCountFromServer(collection(db, "vocabulary")),
      getCountFromServer(collection(db, "users")),
    ]);

  return {
    books: booksSnap.data().count,
    videos: videosSnap.data().count,
    courses: coursesSnap.data().count,
    documentaries: docsSnap.data().count,
    vocabulary: vocabSnap.data().count,
    users: usersSnap.data().count,
  };
}

// ─── Books ────────────────────────────────────────────────────────────────────

export async function getBooks(): Promise<Book[]> {
  const snap = await getDocs(collection(db, "booklist"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
}

export async function addBook(book: Omit<Book, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "booklist"), {
    ...book,
    readingProgress: 0,
    isFavorite: false,
  });
  return ref.id;
}

export async function updateBook(id: string, book: Partial<Book>): Promise<void> {
  await updateDoc(doc(db, "booklist", id), book);
}

export async function deleteBook(id: string): Promise<void> {
  await deleteDoc(doc(db, "booklist", id));
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export async function getVideos(type?: "Short" | "Long"): Promise<Video[]> {
  const col = collection(db, "video_list");
  const q = type ? query(col, where("type", "==", type)) : col;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Video));
}

export async function addVideo(video: Omit<Video, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "video_list"), video);
  return ref.id;
}

export async function updateVideo(id: string, video: Partial<Video>): Promise<void> {
  await updateDoc(doc(db, "video_list", id), video);
}

export async function deleteVideo(id: string): Promise<void> {
  await deleteDoc(doc(db, "video_list", id));
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  const snap = await getDocs(collection(db, "courses"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
}

export async function addCourse(course: Omit<Course, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "courses"), course);
  return ref.id;
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<void> {
  await updateDoc(doc(db, "courses", id), course);
}

export async function deleteCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, "courses", id));
}

// ─── Documentary Videos ───────────────────────────────────────────────────────

export async function getDocumentaries(): Promise<Documentary[]> {
  const snap = await getDocs(collection(db, "documentary_videos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Documentary));
}

export async function addDocumentary(doc_: Omit<Documentary, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "documentary_videos"), doc_);
  return ref.id;
}

export async function updateDocumentary(id: string, data: Partial<Documentary>): Promise<void> {
  await updateDoc(doc(db, "documentary_videos", id), data);
}

export async function deleteDocumentary(id: string): Promise<void> {
  await deleteDoc(doc(db, "documentary_videos", id));
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export async function getVocabulary(): Promise<VocabularyWord[]> {
  const snap = await getDocs(collection(db, "vocabulary"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VocabularyWord));
}

export async function addVocabularyWord(word: Omit<VocabularyWord, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "vocabulary"), word);
  return ref.id;
}

export async function updateVocabularyWord(
  id: string,
  word: Partial<VocabularyWord>
): Promise<void> {
  await updateDoc(doc(db, "vocabulary", id), word);
}

export async function deleteVocabularyWord(id: string): Promise<void> {
  await deleteDoc(doc(db, "vocabulary", id));
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppUser));
}
