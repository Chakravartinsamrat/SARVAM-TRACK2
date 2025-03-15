//node mods
import { redirect } from 'react-router-dom';

//appwrite dependency
import { account, databases } from '../../lib/appwrite';
import { Query } from 'appwrite';

const appLoader = async () => {
  const data = {};
  try {
    data.user = await account.get();
  } catch (err) {
    console.log(`Error getting user session: ${err.message}`);
    return redirect('/login');
  }

  try {
    data.conversations = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      'conversations',
      [Query.select(['$id', 'title']),
       Query.orderDesc('$createdAt'),
        Query.equal('user_id',data.user.$id),        
      ],
    );
    // console.log(data);
  } catch (err) {
    console.log(`Error getting conversations: ${err.message}`);
  }

  return data;
};

export default appLoader;
