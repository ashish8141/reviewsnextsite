import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust the path as necessary
import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firebase

type Review = {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  review: string;
  photoUrl?: string;
  createdAt: Date | Timestamp; // Allow Date or Timestamp
};

type Props = {
  params: {
    businessName: string;
  };
};

export default async function BusinessReviewsPage({ params }: Props) {
  const { businessName } = params;

  // Fetch reviews for the specific business
  const reviews = await getReviews(businessName);

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reviews for the Business: {businessName}</h1>

      {reviews.length > 0 ? (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Phone Number</th>
              <th className="py-3 px-6 text-left">Rating</th>
              <th className="py-3 px-6 text-left">Review</th>
              <th className="py-3 px-6 text-left">Photo</th>
              <th className="py-3 px-6 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{review.name}</td>
                <td className="py-3 px-6 text-left">{review.phoneNumber}</td>
                <td className="py-3 px-6 text-left">{review.rating}</td>
                <td className="py-3 px-6 text-left">{review.review}</td>
                <td className="py-3 px-6 text-left">
                  {review.photoUrl ? (
                    <img
                      src={review.photoUrl}
                      alt="Review Photo"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    'No photo'
                  )}
                </td>
                <td className="py-3 px-6 text-left">
                  {review.createdAt instanceof Timestamp
                    ? review.createdAt.toDate().toLocaleString()
                    : new Date(review.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reviews found for this business.</p>
      )}
    </div>
  );
}

// Helper function to fetch reviews from Firebase
async function getReviews(businessName: string) {
  const reviews: Review[] = [];
  try {
    const businessDocRef = collection(db, 'Businesses', businessName, 'reviews');
    const querySnapshot = await getDocs(businessDocRef);

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
  return reviews;
}
