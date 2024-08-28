'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { db, storage } from '../firebase'; // Adjust the path as necessary
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { setDoc } from 'firebase/firestore'; // Add this import

type Business = {
  linkName: string;
  googleReviewLink: string;
  fileName: string | null;
  fileUrl: string | null;
  id: string;
  businessName: string;  // Add this line
};

export default function Dashboard() {
  const [linkName, setLinkName] = useState('');
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [lockCodeInput, setLockCodeInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lockScreenCode, setLockScreenCode] = useState('');
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');


  useEffect(() => {
    const fetchBusinesses = async () => {
      const querySnapshot = await getDocs(collection(db, 'Businesses'));
      const businessesData: Business[] = [];
      querySnapshot.forEach((doc) => {
        businessesData.push({
          id: doc.id,
          ...doc.data(),
        } as Business);
      });
      setBusinesses(businessesData);
    };

    fetchBusinesses();
  }, [createdLink]);

  const handleSubmit = async () => {
    if (!selectedFile) return;
  
    try {
      const fileRef = ref(storage, `businesses/${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
  
      await setDoc(doc(db, 'Businesses', linkName), {
        linkName,
        googleReviewLink,
        fileName: selectedFile.name,
        fileUrl: `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/businesses%2F${encodeURIComponent(selectedFile.name)}?alt=media`,
        businessName,  // Add this line
      });
  
      setCreatedLink(`${window.location.origin}/business/${linkName}`);
      setAlertDialogOpen(true);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (lockCodeInput !== '8141') {
      setDeleteMessage('Incorrect code. Please try again.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'Businesses', id));
      const businessDoc = businesses.find(b => b.id === id);
      if (businessDoc && businessDoc.fileName) {
        const fileRef = ref(storage, `businesses/${businessDoc.fileName}`);
        await deleteObject(fileRef);
      }
      setBusinesses(businesses.filter(b => b.id !== id));
      setDeleteMessage('The item is deleted');
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleteDialogOpen(false); // Close the dialog after attempting to delete
      setLockCodeInput(''); // Clear the input field
    }
  };

  const handleCopy = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      alert('Link copied to clipboard!');
    }
  };

  const handleUnlock = () => {
    if (lockScreenCode === '8141') {
      setIsUnlocked(true);
    } else {
      alert('Incorrect code. Please try again.');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <CardTitle>Enter Code to Unlock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="lockCode">Code</Label>
              <Input
                id="lockCode"
                type="password"
                value={lockScreenCode}
                onChange={(e) => setLockScreenCode(e.target.value)}
                placeholder="Enter Password"
              />
              <Button onClick={handleUnlock} className="w-full">
                Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Main Dashboard Content */}
      <h1 className="text-2xl font-bold text-center">Admin Review Link</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add a New Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkName">Link Name</Label>
              <Input
                id="linkName"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Enter link name"
              />
            </div>

            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
              />
            </div>




            <div>
              <Label htmlFor="googleReviewLink">Google Review Link</Label>
              <Input
                id="googleReviewLink"
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                placeholder="Enter Google review link"
              />
            </div>

            <div>
              <Label htmlFor="file">Upload Picture</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button onClick={handleSubmit}>Add Link</Button>
          </div>
        </CardContent>
      </Card>

      {createdLink && (
        <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="hidden">Trigger</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Link Created Successfully</AlertDialogTitle>
              <AlertDialogDescription>
                Your new link has been created. You can copy it using the button below:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center mt-4 space-x-2">
              <Input readOnly value={createdLink} className="flex-1" />
              <Button onClick={handleCopy}>Copy Link</Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Card className="max-w-full mx-auto">
        <CardHeader>
          <CardTitle>Available Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Link</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={() => router.push(`/business/${business.id}`)}
                          className="w-full"
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => router.push(`/reviews/${business.linkName}`)}
                          className="w-full"
                        >
                          See Reviews
                        </Button>
                        <Button
                          onClick={() => {
                            setBusinessToDelete(business.id);
                            setDeleteDialogOpen(true); // Open the delete dialog
                          }}
                          className="w-full"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{business.linkName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {business.fileUrl ? (
                        <img 
                          src={business.fileUrl} 
                          alt={business.fileName || 'Image'} 
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={business.googleReviewLink} target="_blank" rel="noopener noreferrer">
                        {business.googleReviewLink}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="hidden">Trigger</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the code to confirm deletion:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4 space-y-4">
              <Input
                type="text"
                placeholder="Enter code"
                value={lockCodeInput}
                onChange={(e) => setLockCodeInput(e.target.value)}
                className="w-full"
              />
              {deleteMessage && <p className="text-red-500">{deleteMessage}</p>}
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    if (businessToDelete) handleDelete(businessToDelete);
                  }}
                >
                  Confirm Delete
                </Button>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
