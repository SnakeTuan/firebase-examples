'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { 
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp 
} from 'firebase/firestore'
import { 
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
} from 'firebase/storage'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { db, storage } from '@/config/firebase'

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export function StorageCrud() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  // Fetch all users from 'users' collection
  const fetchUsers = async () => {
    setLoading(true)
    const getCollection = await getDocs(collection(db, 'users'))
    const fetchedUsers = getCollection.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
    setUsers(fetchedUsers)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Upload avatar
  const uploadAvatar = async (userId: string) => {
    if (!selectedFile) return
    setUploading(true)
    const storageRef = ref(storage, `avatars/${userId}/${selectedFile.name}`)
    await uploadBytes(storageRef, selectedFile)
    const url = await getDownloadURL(storageRef)
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { avatarUrl: url })
    setSelectedFile(null)
    setUploading(false)
    fetchUsers()
  }

  // Delete avatar
  const deleteAvatar = async (user: User) => {
    if (!user.avatarUrl) return
    setUploading(true)
    const storageRef = ref(storage, `avatars/${user.id}/${user.avatarUrl.split('/').pop()}`)
    await deleteObject(storageRef)
    const userRef = doc(db, 'users', user.id)
    await updateDoc(userRef, { avatarUrl: null })
    setUploading(false)
    fetchUsers()
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Firebase Users CRUD Example</h1>

      {loading ? (
        // Show loading icon while fetching users
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">User ID</th>
              <th className="py-2">User Name</th>
              <th className="py-2">Avatar</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="text-center">
                <td className="border px-4 py-2">{user.id}</td>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 object-cover mx-auto" />
                  ) : (
                    'No Avatar'
                  )}
                </td>
                <td className="border px-4 py-2">
                  {user.avatarUrl ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => setEditingUserId(user.id)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteAvatar(user)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => setEditingUserId(user.id)}
                    >
                      <Plus size={16} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Upload Avatar Modal */}
      {editingUserId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-96 p-4">
            <CardContent>
              <h2 className="text-xl mb-4">Upload Avatar</h2>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setEditingUserId(null)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => uploadAvatar(editingUserId)}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}