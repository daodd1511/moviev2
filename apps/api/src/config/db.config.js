import mongoose from 'mongoose';

export const connectDatabase = async uri => {
  await mongoose.connect(uri);
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

export const getDatabaseState = () => mongoose.connection.readyState;
