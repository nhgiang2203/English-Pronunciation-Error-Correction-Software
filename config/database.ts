import mongoose from "mongoose";

export const connect = async(): Promise<void> => {
  console.log('MONGO_URL:', process.env.MONGO_URL);

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connect Success!');
  } 
  catch(error) {
    console.error('Connect Error:', error);
    console.log('Connect Error');
  }
}



// export const connect = async (): Promise<void> => {
//   try {
//     await mongoose.connect("mongodb://localhost:27017/part1");
//     console.log("Kết nối MongoDB local thành công!");
//   } catch (error) {
//     console.error("Lỗi kết nối MongoDB local:", error);
//   }
// };
