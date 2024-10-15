'use client'

import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { db } from '@/config/firebase'


export function DatabaseCRUD() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [editingUser, setEditingUser] = useState<any>(null)
  
  // Fetch all users from 'users' collection
  const fetchUsers = async () => {
    setLoading(true)
    const getCollection = await getDocs(collection(db, 'users'))
    const fetchedUsers = getCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setUsers(fetchedUsers)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Add a new user to 'users' collection
  const addUser = async () => {
    if (newUserName.trim() === '' || newUserEmail.trim() === '') {
      return alert('Please fill in all the fields')
    }
    await addDoc(collection(db, 'users'), { 
      name: newUserName, 
      email: newUserEmail 
    })
    setNewUserName('')
    setNewUserEmail('')
    fetchUsers()
    alert('User added successfully')
  }

  // Update an existing user in 'users' collection
  const updateUser = async () => {
    if (editingUser && (editingUser.name.trim() === '' || editingUser.email.trim() === '')) {
      return alert('Please fill in all the fields')
    }
    try {
      await updateDoc(doc(db, 'users', editingUser.id), { 
        name: editingUser.name, 
        email: editingUser.email 
      })
      setEditingUser(null)
      fetchUsers()
      alert('User updated successfully')
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // Delete a user from 'users' collection
  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id))
    fetchUsers()
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Firebase Users CRUD Example</h1>
      

      <div className="mb-6">

        {/* Add a user to 'users' collection */}
        <div className="flex gap-4 mb-4">
          <Input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="User Name"
            className="flex-grow"
          />
          <Input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="User Email"
            className="flex-grow"
          />
          <Button onClick={addUser} className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

      </div>

      {loading ? (
        // Show loading icon while fetching users
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        // Show all users in 'users' collection
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-4 border-b">
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <span className="flex-grow mr-2">{user.id}</span>
                    <Input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="flex-grow mr-2"
                    />
                    <Input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="flex-grow mr-2"
                    />
                  </>
                ) : (
                  <>
                    <span className="flex-grow text-center">{user.id}</span>
                    <span className="flex-grow text-center">{user.name}</span>
                    <span className="flex-grow text-center">{user.email}</span>
                  </>
                )}
                <div className="flex gap-2">
                  {editingUser && editingUser.id === user.id ? (
                    <Button onClick={updateUser} size="sm" variant="outline">
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => setEditingUser(user)} size="sm" variant="outline">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                  <Button onClick={() => deleteUser(user.id)} size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}