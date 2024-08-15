import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

async function getUserById(id: string) {
  const userRef = collection(db, 'users');
  const querySnapshot = await getDocs(userRef);
  const user = querySnapshot.docs.find((doc) => doc.id === id);
  return user;
}
