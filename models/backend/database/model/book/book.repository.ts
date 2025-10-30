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

type SortOrder = 'asc' | 'desc';

// Only allow sorting by title, publishedYear, or price
const ALLOWED_SORT_FIELDS: Array<keyof IBook> = [
  'title',
  'publishedYear',
  'price'
];

export async function getAllBooks(options?: {
  start?: number;
  limit?: number; // 0 or undefined means unlimited
  sortBy?: keyof IBook;
  sortOrder?: SortOrder;
}): Promise<IBook[] | null> {
  const model = MongoDBManager.getInstance().getModel<IBook>(BOOK_COLLECTION, bookSchema);

  // Defaults per requirement: sort by title (ASCII), order asc, unlimited, skip 0
  const sortBy = options?.sortBy && ALLOWED_SORT_FIELDS.includes(options.sortBy) ? options.sortBy : 'title';
  const sortOrder = options?.sortOrder === 'desc' ? -1 : 1;
  const start = typeof options?.start === 'number' && options!.start! > 0 ? options!.start! : 0;
  const limit = typeof options?.limit === 'number' && options!.limit! > 0 ? options!.limit! : 0;

  let query = model.find();
  query = query.sort({ [sortBy]: sortOrder });
  if (start > 0) query = query.skip(start);
  if (limit > 0) query = query.limit(limit);

  const books = await query.lean();
  return books ? JSON.parse(JSON.stringify(books)) : null;
}

// Search books with regex across multiple fields
export async function searchBooksByFields(searchCriteria: {
  bookid?: string[];
  genres?: string[];
  title?: string;
  author?: string;
  description?: string;
  publishedYear?: string;
  minPrice?: number;
  maxPrice?: number;
  start?: number;
  limit?: number; // 0 or undefined means unlimited
  sortBy?: keyof IBook;
  sortOrder?: SortOrder;
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

  // Search by book IDs
  if (searchCriteria.bookid && searchCriteria.bookid.length > 0) {
    var idArray: string[] = [];
    for (const id of searchCriteria.bookid) {
        idArray.push(id.trim());
    }
    query._id = { $in: idArray };
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
  
  // Build base query
  let mongooseQuery = model.find(query);

  // Sorting
  const sortBy = searchCriteria.sortBy && ALLOWED_SORT_FIELDS.includes(searchCriteria.sortBy) ? searchCriteria.sortBy : 'title';
  const sortOrder = searchCriteria.sortOrder === 'desc' ? -1 : 1;
  mongooseQuery = mongooseQuery.sort({ [sortBy]: sortOrder });

  // Pagination
  const start = typeof searchCriteria.start === 'number' && searchCriteria.start > 0 ? searchCriteria.start : 0;
  const limit = typeof searchCriteria.limit === 'number' && searchCriteria.limit > 0 ? searchCriteria.limit : 0;
  if (start > 0) mongooseQuery = mongooseQuery.skip(start);
  if (limit > 0) mongooseQuery = mongooseQuery.limit(limit);

  const books = await mongooseQuery.lean();
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

