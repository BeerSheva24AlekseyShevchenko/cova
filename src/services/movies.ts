import { connectToDB } from "../core/db";
import { ObjectId } from "mongodb";

const getMostFilter = ({ year, actor, genres, language }: any) => ({
  ...(year && { year: parseInt(year)}),
  ...(actor && { actor: { $regex: actor, $options: 'i' }}),
  ...(genres && { genres: { $all: genres.split(',') }}),
  ...(language && { languages:  { $in: [language] } }),
});

export const getMovie = async (id: string) => {
  const db = await connectToDB();
  const data = await db.collection('movies').findOne({ _id: new ObjectId(id) })
  return data;
};

export const getMostRated = async (filter: any) => {
  const amount = filter.amount;
  const db = await connectToDB();
  const data = await db.collection('movies').aggregate([
    { $match: getMostFilter(filter) },
    { $addFields: {
      numericRating: {
        $cond: {
          if: { $eq: ['$imdb.rating', ''] },
          then: null,
          else: { $toInt: '$imdb.rating' }
        }
      }
    } },
    { $sort: { numericRating: -1 } },
    { $limit: parseInt(amount ?? 10) },
    { $project: {
        _id: 1,
        title: 1,
        imdbId: '$imdb.id',
        rating: '$imdb.rating'
    } }
  ]).toArray();

  return data;
};

export const getMostCommented = async (filter: any) => {
  const amount = filter.amount;
  const db = await connectToDB();
  const data = await db.collection('movies')
    .find(getMostFilter(filter))
    .sort({ 'num_mflix_comments': -1 })
    .limit(parseInt(amount ?? 10))
    .project({
      _id: 1,
      title: 1,
      imbdId: '$imdb.id',
      comments: '$num_mflix_comments',
    })
    .toArray();

  return data;
};

export const addRate = async (id: string, rating: number) => {
  const db = await connectToDB();
  const result = await db.collection('movies').updateMany(
      { 'imdb.id': id },
      { $set: { 'imdb.rating': rating } }
  );

  return { updated: result.modifiedCount };
};
