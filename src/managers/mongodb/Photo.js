import MongodbManager from '../../adapters/DAOMongodbManager';
import { ObjectId } from 'mongodb';

export const getPhoto = async (id) => {
  const db = await MongodbManager();
  const collection = await db.collection('photos');
  const query = { _id: new ObjectId(id) };
  const aPhoto = await collection.findOne(query);
  return aPhoto;
};

export const saveFile = async () => ({});

export const deleteFile = async () => ({});
