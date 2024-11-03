'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, LogOut } from "lucide-react";

type User = {
  id: number;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

type Bill = {
  id: string;
  userId: number;
  userName: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
};

const users: User[] = [
  { id: 1, name: "Zohaib" },
  { id: 2, name: "Babar" },
  { id: 3, name: "Mustafa" }
];

const categories: Category[] = [
  { id: "food", name: "Food" },
  { id: "transport", name: "Transport" },
  { id: "utilities", name: "Utilities" },
  { id: "entertainment", name: "Entertainment" },
  { id: "other", name: "Other" }
];

// Simple UUID generator replacement
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Date formatter replacement
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  useEffect(() => {
    const savedBills = localStorage.getItem('billRecords');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  const handleUserSelect = (user: User) => {
    if (selectedUser && selectedUser.id !== user.id) {
      setAmount('');
      setDescription('');
      setCategory('');
      setError('');
    }
    setSelectedUser(user);
  };

  const logout = () => {
    setSelectedUser(null);
    setAmount('');
    setDescription('');
    setCategory('');
    setError('');
  };

  const saveBill = () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    const newBill: Bill = {
      id: generateId(),
      userId: selectedUser.id,
      userName: selectedUser.name,
      amount: parseFloat(amount),
      date: selectedDate?.toISOString() || new Date().toISOString(),
      category,
      description
    };

    const updatedBills = [...bills, newBill];
    setBills(updatedBills);
    localStorage.setItem('billRecords', JSON.stringify(updatedBills));
    
    setAmount('');
    setDescription('');
    setCategory('');
    setError('');
  };

  const confirmDelete = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill && bill.userId === selectedUser?.id) {
      setBillToDelete(billId);
    } else {
      setError("You can only delete your own bills");
    }
  };

  const deleteBill = () => {
    if (billToDelete) {
      const updatedBills = bills.filter(bill => bill.id !== billToDelete);
      setBills(updatedBills);
      localStorage.setItem('billRecords', JSON.stringify(updatedBills));
      setBillToDelete(null);
    }
  };

  const getUserTotal = (userId: number): string => {
    return bills
      .filter(bill => bill.userId === userId)
      .reduce((sum, bill) => sum + bill.amount, 0)
      .toFixed(2);
  };

  const getGrandTotal = (): string => {
    return bills
      .reduce((sum, bill) => sum + bill.amount, 0)
      .toFixed(2);
  };

  const getCategoryTotal = (categoryName: string): string => {
    return bills
      .filter(bill => bill.category === categoryName)
      .reduce((sum, bill) => sum + bill.amount, 0)
      .toFixed(2);
  };

  const filteredBills = bills
    .filter(bill => {
      const matchesSearch = 
        bill.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.amount.toString().includes(searchTerm);
      
      const matchesDate = dateFilter 
        ? new Date(bill.date).toDateString() === dateFilter.toDateString()
        : true;
      
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bill Record System</CardTitle>
            {selectedUser && (
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!selectedUser ? (
                <div className="flex gap-4 flex-wrap">
                  {users.map(user => (
                    <Button
                      key={user.id}
                      variant="outline"
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-medium">Logged in as: {selectedUser.name}</p>
                </div>
              )}

              {selectedUser && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Search className="mr-2 h-4 w-4" />
                        {selectedDate ? formatDate(selectedDate) : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-col md:flex-row gap-4">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="md:max-w-xs"
                    />
                    <Input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <Button onClick={saveBill}>Save Bill</Button>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {users.map(user => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="text-lg">{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{getUserTotal(user.id)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xl font-bold">₹{getCategoryTotal(cat.id)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-blue-50">
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{getGrandTotal()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search bills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      {dateFilter ? formatDate(dateFilter) : "Filter by date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateFilter && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setDateFilter(undefined)}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>

              {filteredBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{bill.userName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(bill.date).toLocaleDateString()}
                    </p>
                    {bill.description && (
                      <p className="text-sm text-gray-600">{bill.description}</p>
                    )}
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-200 rounded-full">
                      {categories.find(cat => cat.id === bill.category)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">₹{bill.amount.toFixed(2)}</p>
                    {selectedUser?.id === bill.userId && (
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDelete(bill.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={!!billToDelete} onOpenChange={() => setBillToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the bill record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteBill}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}