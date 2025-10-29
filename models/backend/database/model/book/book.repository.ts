import { MongoDBManager } from "../../mongodb.manager";
import { IBook } from "../schema/bookSchema";
import { bookSchema } from "../schema/bookSchema";

export const BOOK_COLLECTION = 'books';

export async function createBook(book: IBook): Promise<true> {
  const model = MongoDBManager.getInstance().getModel<IBook>(BOOK_COLLECTION, bookSchema);
  await model.create(book);
  return true;
};



export async function hasBookById(bookId: string): Promise<boolean> {
  const model = MongoDBManager.getInstance().getModel(BOOK_COLLECTION, bookSchema);
  const book = await model.findById(bookId).lean();
  return !!book;
}

export async function getAllBooks(): Promise<IBook[] | null> {
  const model = MongoDBManager.getInstance().getModel<IBook>(BOOK_COLLECTION, bookSchema);
  const books = await model.find().lean();
  return books ? JSON.parse(JSON.stringify(books)) : null;
}

// Search books with regex across multiple fields
export async function searchBooksByFields(searchCriteria: {
  genres?: string[];
  title?: string;
  author?: string;
  description?: string;
  publishedYear?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<IBook[] | null> {
  const model = MongoDBManager.getInstance().getModel<IBook>(BOOK_COLLECTION, bookSchema);
  
  const query: any = {};
  
  // Add regex search for text fields
  if (searchCriteria.title) {
    query.title = { $regex: searchCriteria.title.trim(), $options: 'i' };
  }
  
  if (searchCriteria.author) {
    query.author = { $regex: searchCriteria.author.trim(), $options: 'i' };
  }
  
  if (searchCriteria.description) {
    query.description = { $regex: searchCriteria.description.trim(), $options: 'i' };
  }
  
  // Search for genres (books must have ALL specified genres)
  if (searchCriteria.genres && searchCriteria.genres.length > 0) {
    var newArray: string[] = [];
    for (const genre of searchCriteria.genres) {
        newArray.push(genre.trim());
    }
    query.genres = { $all: newArray };
  }
  
  // Exact match for published year
  if (searchCriteria.publishedYear) {
    query.publishedYear = searchCriteria.publishedYear.trim();
  }
  
  // Price range search
  if (searchCriteria.minPrice !== undefined || searchCriteria.maxPrice !== undefined) {
    query.price = {};
    if (searchCriteria.minPrice !== undefined) {
      query.price.$gte = searchCriteria.minPrice;
    }
    if (searchCriteria.maxPrice !== undefined) {
      query.price.$lte = searchCriteria.maxPrice;
    }
  }
  
  const books = await model.find(query).lean();
  return books ? JSON.parse(JSON.stringify(books)) : null;
}

export async function getBookById(bookId: string): Promise<IBook | null> {
  return getBooksByIds([bookId]).then(books => books ? books[0] : null);
}

export async function getBooksByIds(bookIds: string[]): Promise<IBook[] | null> {
  const model = MongoDBManager.getInstance().getModel<IBook>(BOOK_COLLECTION, bookSchema);
  const books = await model.find({ _id: { $in: bookIds } }).lean();
  return books ? JSON.parse(JSON.stringify(books)) : null;
}

export async function updateBookById(bookId: string, updateData: Partial<IBook>): Promise<true> {
  const model = MongoDBManager.getInstance().getModel<IBook>(BOOK_COLLECTION, bookSchema);
  await model.updateOne({ _id: bookId }, { $set: updateData });
  return true;
}

export async function deleteBookByIds(bookIds: string[]): Promise<true> {
  const model = MongoDBManager.getInstance().getModel(BOOK_COLLECTION, bookSchema);
  await model.deleteMany({ _id: { $in: bookIds } });
  return true;
}

