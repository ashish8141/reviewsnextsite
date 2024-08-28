// app/business/[id]/page.tsx

import { db, storage } from '../../../firebase'; // Adjust the path as necessary
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { notFound } from 'next/navigation';
import BusinessDetailsClient from './BusinessDetailsClient'; // Import the client component

type Business = {
  linkName: string;
  googleReviewLink: string;
  fileName: string | null;
  fileUrl: string | null;
  id: string;
  businessName: string; // Added businessName
};

type Props = {
  business: Business | null;
  error: string | null;
};

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return notFound(); // Return a 404 page if the ID is invalid
  }

  let business: Business | null = null;
  let error: string | null = null;

  try {
    const docRef = doc(db, 'Businesses', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const fileUrl = data.fileName
        ? await getDownloadURL(ref(storage, `businesses/${data.fileName}`))
        : null;

      business = {
        id: docSnap.id,
        fileUrl,
        businessName: data.businessName, // Ensure businessName is included
        ...data,
      } as Business;
    } else {
      error = 'No such document!';
    }
  } catch (err) {
    console.error('Error fetching document:', err);
    error = 'Error fetching document';
  }

  return (
    <div className="p-6 space-y-6">
      {error && <p>{error}</p>}
      {business ? (
        <BusinessDetailsClient business={business} /> // Use the client component
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
