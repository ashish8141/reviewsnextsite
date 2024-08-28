'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Adjust the import path if necessary
import { Input } from '@/components/ui/input'; // Adjust the import path if necessary
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogCancel } from '@/components/ui/alert-dialog'; // Adjust import if necessary
import { db, storage } from '../../../firebase'; // Adjust the path as necessary
import { addDoc, collection, doc, getFirestore } from 'firebase/firestore';

type Business = {
  linkName: string;
  googleReviewLink: string;
  fileName: string | null;
  fileUrl: string | null;
  id: string;
  businessName: string;
};

type Props = {
  business: Business;
};

export default function BusinessDetailsClient({ business }: Props) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);

    if (newRating >= 4 && business.googleReviewLink) {
      window.location.href = business.googleReviewLink.startsWith('http')
        ? business.googleReviewLink
        : `http://${business.googleReviewLink}`;
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPhoto(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (rating < 4) {
      setAlertDialogOpen(true);
    }

    try {
      const businessDocRef = doc(db, 'Businesses', business.linkName);
      const reviewsCollectionRef = collection(businessDocRef, 'reviews');
      
      const reviewData = {
        name,
        phoneNumber,
        rating,
        review,
        createdAt: new Date(),
      };

      await addDoc(reviewsCollectionRef, reviewData);

      setName('');
      setPhoneNumber('');
      setRating(0);
      setReview('');
      setPhoto(null);

      setAlertDialogOpen(true);
    } catch (error) {
      console.error("Error adding review: ", error);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <div className="flex items-center space-x-4">
        {business.fileUrl && (
          <img
            src={business.fileUrl}
            alt={business.businessName}
            className="w-24 h-24 object-cover rounded-full"
          />
        )}

        <div>
          <h1 className="text-2xl font-bold">{business.businessName}</h1>
          <p className="text-sm text-gray-500">Posting publicly across Google</p>
        </div>
      </div>

      <div className="flex justify-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-8 w-8 cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
            onClick={() => handleRatingChange(star)}
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>

      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your Name"
        className="w-full"
      />

      <Input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter your phone Number"
        className="w-full"
      />

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share details of your own experience at this place"
        className="w-full h-24 p-2 border border-gray-300 rounded-md"
        rows={3}
      />

      {/* Custom Add Button with Camera Icon */}
      <label className="w-full flex items-center justify-center cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    className="h-6 w-6 mr-2"
    fill="white"
  >
    <path d="M10 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm8-3h-2.4a.888.888 0 0 1-.789-.57l-.621-1.861A.89.89 0 0 0 13.4 2H6.6c-.33 0-.686.256-.789.568L5.189 4.43A.889.889 0 0 1 4.4 5H2C.9 5 0 5.9 0 7v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 11a5 5 0 0 1-5-5 5 5 0 1 1 10 0 5 5 0 0 1-5 5zm7.5-7.8a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4z"></path>
  </svg>
  Add Photo
  <input
    type="file"
    accept="image/*"
    onChange={handlePhotoChange}
    className="hidden"
  />
</label>

      <Button onClick={handleSubmit} className="w-full">
        Submit Review
      </Button>

      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button className="hidden">Trigger</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-blue-100 text-center p-6 rounded-lg shadow-lg max-w-sm mx-auto">
          <AlertDialogHeader className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="80" height="80" viewBox="0 0 50 50">
              <path d="M 25 2 C 12.317 2 2 12.317 2 25 C 2 37.683 12.317 48 25 48 C 37.683 48 48 37.683 48 25 C 48 20.44 46.660281 16.189328 44.363281 12.611328 L 42.994141 14.228516 C 44.889141 17.382516 46 21.06 46 25 C 46 36.579 36.579 46 25 46 C 13.421 46 4 36.579 4 25 C 4 13.421 13.421 4 25 4 C 30.443 4 35.393906 6.0997656 39.128906 9.5097656 L 40.4375 7.9648438 C 36.3525 4.2598437 30.935 2 25 2 z M 43.236328 7.7539062 L 23.914062 30.554688 L 15.78125 22.96875 L 14.417969 24.431641 L 24.083984 33.447266 L 44.763672 9.046875 L 43.236328 7.7539062 z"></path>
            </svg>

            <AlertDialogTitle className="text-lg font-bold">Thanks for rating!</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              Your contribution helps everyone make better decisions about places to go.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <AlertDialogCancel 
              className="text-blue-600 font-semibold"
              onClick={() => setAlertDialogOpen(false)}
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
