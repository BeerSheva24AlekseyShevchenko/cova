import { ObjectId } from 'mongodb';
import { connectToDB } from '../core/db';
import { AppError } from '../core/errors';

export const addFavorite = async (email: string, data: any) => {
  const newFavorite = {
    _id: new ObjectId(),
    email,
    movie_id: new ObjectId(data.movieId),
    feed_back: data.feedBack ?? '',
    viewed: data.viewed ?? false,
  };
  const db = await connectToDB();
  const existingFavorite = await db.collection('favorites').findOne({
    email,
    movie_id: new ObjectId(data.movieId),
  });
  if (existingFavorite) throw new AppError('Movie already added', 409);
  const result = await db.collection('favorites').insertOne(newFavorite);
  if(!result) throw new AppError('Failed to add favorite', 500);

  return newFavorite;
};

export const getFavorite = async (id: string) => {
  const db = await connectToDB();
  const favorite = await db.collection('favorites').findOne({ _id: new ObjectId(id) });
  return favorite;
};

export const getUserFavoriteMovies = async (email: string) => {
  const db = await connectToDB();
  const favorites = await db.collection('favorites')
    .find({ email })
    .toArray();
  return favorites;
};

export const updateFavorite = async (id: string, data: any) => {
  const { viewed, feedBack } = data;
  const db = await connectToDB();
  const result = await db.collection('favorites').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { 
      ...(viewed !== undefined && { viewed }),
      ...(feedBack !== undefined && { feed_back: feedBack})
    }},
    { returnDocument: 'after' }
  );
  if(!result) throw new AppError('Favorite not found', 404);

  return result;
};

export const deleteFavorite = async (id: string) => {
  const db = await connectToDB();
  const result = await db.collection('favorites')
    .findOneAndDelete({ _id: new ObjectId(id)});
  if (!result) throw new AppError('Favorite not found', 404);

  return result;
};
