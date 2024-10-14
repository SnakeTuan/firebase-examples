'use client'

import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { db } from '@/config/firebase'


export function FirebaseCrud() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newUserName, setNewUserName] = useState('')
  const [newUserGmail, setNewUserGmail] = useState('')
  const [newUserBirth, setNewUserBirth] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<any>(null)
  
  // fetch all users from 'users' collection
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

  // add a new user to 'users' collection
  const addUser = async () => {
    if (newUserName.trim() === '' || newUserGmail.trim() === '') {
      return alert('Please fill in all the fields')
    }
    await addDoc(collection(db, 'users'), { 
      name: newUserName, 
      gmail: newUserGmail, 
      birth: Timestamp.fromDate(new Date(newUserBirth)) 
    })
    setNewUserName('')
    setNewUserGmail('')
    setNewUserBirth('')
    fetchUsers()
    alert('User added successfully')
  }

  // update an existing user in 'users' collection
  const updateUser = async () => {
    if (editingUser && editingUser.name.trim() == '' && editingUser.gmail.trim() == '') {
      return alert('Please fill in all the fields')
    }
    try {
      await updateDoc(doc(db, 'users', editingUser.id), { 
        name: editingUser.name, 
        gmail: editingUser.gmail, 
        birth: Timestamp.fromDate(new Date(editingUser.birth)) 
      })
      setEditingUser(null)
      fetchUsers()
      alert('User updated successfully')
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // delete a user from 'users' collection
  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id))
    fetchUsers()
  }

  // search for users in 'users' collection
  const searchUsers = async () => {
    if (searchQuery.trim() === '') {
      fetchUsers()
      return
    }
    setLoading(true)
    const q = query(
      collection(db, 'users'), 
      where('name', '>=', searchQuery), 
      where('name', '<=', searchQuery + '\uf8ff')
    )
    const querySnapshot = await getDocs(q)
    const searchResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setUsers(searchResults)
    setLoading(false)
  }


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Firebase Users CRUD Example</h1>
      

      <div className="mb-6">

        {/* add an user to 'user' collection */}
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
            value={newUserGmail}
            onChange={(e) => setNewUserGmail(e.target.value)}
            placeholder="User Gmail"
            className="flex-grow"
          />
          <Input
            type="date"
            value={newUserBirth}
            onChange={(e) => setNewUserBirth(e.target.value)}
            placeholder="Birthday"
            className="flex-grow"
          />
          <Button onClick={addUser} className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* search an user in 'user' collection */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users"
            className="flex-grow"
          />
          <Button onClick={searchUsers} variant="outline" className="flex-shrink-0">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

      </div>

      {loading ? (
        // show loading icon while fetching users
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        // show all users in 'users' collection
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-4">
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <Input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="flex-grow mr-2"
                    />
                    <Input
                      type="email"
                      value={editingUser.gmail}
                      onChange={(e) => setEditingUser({ ...editingUser, gmail: e.target.value })}
                      className="flex-grow mr-2"
                    />
                    <Input
                      type="date"
                      value={editingUser.birth}
                      onChange={(e) => setEditingUser({ ...editingUser, birth: e.target.value })}
                      className="flex-grow mr-2"
                    />
                  </>
                ) : (
                  <>
                    <span className="flex-grow">{user.name}</span>
                    <span className="flex-grow">{user.gmail}</span>
                    <span className="flex-grow">{user.birth.toDate().toLocaleDateString()}</span>
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