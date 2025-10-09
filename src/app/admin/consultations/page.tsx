"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Mail, Phone, Clock, CheckCircle, 
  XCircle, Eye, Trash2, User, Calendar, AlertCircle,
  MessageSquare, UserCheck, AlertOctagon
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/context';

interface Consultation {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  age: number;
  gender?: 'male' | 'female' | 'other';
  skinType: 'oily' | 'dry' | 'normal' | 'combination' | 'sensitive';
  mainProblem: string;
  problemDuration: string;
  currentProducts?: string;
  images?: string[];
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  additionalComments?: string;
  status: 'pending' | 'read' | 'contacted' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  adminNotes?: string;
  contactedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsultationStats {
  total: number;
  pending: number;
  read: number;
  contacted: number;
  resolved: number;
  closed: number;
}

export default function AdminConsultationsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<ConsultationStats>({
    total: 0,
    pending: 0,
    read: 0,
    contacted: 0,
    resolved: 0,
    closed: 0
  });
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [adminNotes, setAdminNotes] = useState('');

  // Check authentication
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadConsultations();
    loadStats();
  }, [statusFilter, priorityFilter, searchTerm]);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const response = await adminApi.consultations.getConsultations({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined,
        page: 1,
        limit: 50
      });
      setConsultations(response.data || []);
    } catch (error) {
      console.error('Failed to load consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminApi.consultations.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: Consultation['status']) => {
    try {
      await adminApi.consultations.updateConsultationStatus(id, status);
      
      loadConsultations();
      loadStats();
      
      if (selectedConsultation?._id === id) {
        setSelectedConsultation(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleUpdatePriority = async (id: string, priority: 'low' | 'medium' | 'high') => {
    try {
      await adminApi.consultations.updateConsultation(id, { priority });
      
      loadConsultations();
      
      if (selectedConsultation?._id === id) {
        setSelectedConsultation(prev => prev ? { ...prev, priority } : null);
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await adminApi.consultations.updateConsultation(id, { adminNotes });
      
      loadConsultations();
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return;

    try {
      await adminApi.consultations.deleteConsultation(id);
      
      loadConsultations();
      loadStats();
      setSelectedConsultation(null);
    } catch (error) {
      console.error('Failed to delete consultation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skincare Consultations</h1>
        <p className="text-gray-600 mt-2">Manage and respond to customer skincare consultation requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-2xl font-bold text-blue-800">{stats.read}</div>
          <div className="text-sm text-blue-700">Read</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
          <div className="text-2xl font-bold text-purple-800">{stats.contacted}</div>
          <div className="text-sm text-purple-700">Contacted</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
          <div className="text-sm text-green-700">Resolved</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-gray-800">{stats.closed}</div>
          <div className="text-sm text-gray-700">Closed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search consultations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="read">Read</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="relative">
            <AlertOctagon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Consultation Requests</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : consultations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No consultations found</div>
            ) : (
              consultations.map((consultation) => (
                <div
                  key={consultation._id}
                  onClick={() => {
                    setSelectedConsultation(consultation);
                    setAdminNotes(consultation.adminNotes || '');
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConsultation?._id === consultation._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{consultation.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{consultation.mainProblem}</p>
                      <p className="text-xs text-gray-500">Age: {consultation.age} • {consultation.skinType}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                      {consultation.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(consultation.priority)}`}>
                          {consultation.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {consultation.phone}
                    </span>
                    {consultation.email && (
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {consultation.email}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(consultation.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg shadow">
          {selectedConsultation ? (
            <div>
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Consultation Details</h2>
                <button
                  onClick={() => handleDelete(selectedConsultation._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-900"><strong>Name:</strong> {selectedConsultation.name}</p>
                    <p className="text-gray-900"><strong>Phone:</strong> {selectedConsultation.phone}</p>
                    {selectedConsultation.email && (
                      <p className="text-gray-900"><strong>Email:</strong> {selectedConsultation.email}</p>
                    )}
                    <p className="text-gray-900"><strong>Address:</strong> {selectedConsultation.address}</p>
                    <p className="text-gray-900"><strong>Age:</strong> {selectedConsultation.age}</p>
                    {selectedConsultation.gender && (
                      <p className="text-gray-900"><strong>Gender:</strong> {selectedConsultation.gender}</p>
                    )}
                    <p className="text-gray-900"><strong>Preferred Contact:</strong> {selectedConsultation.preferredContactMethod}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Submitted:</strong> {new Date(selectedConsultation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Skin Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Skin Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-900"><strong>Skin Type:</strong> <span className="capitalize">{selectedConsultation.skinType}</span></p>
                    <p className="text-gray-900"><strong>Main Problem:</strong> {selectedConsultation.mainProblem}</p>
                    <p className="text-gray-900"><strong>Problem Duration:</strong> {selectedConsultation.problemDuration}</p>
                    {selectedConsultation.currentProducts && (
                      <p className="text-gray-900"><strong>Current Products:</strong> {selectedConsultation.currentProducts}</p>
                    )}
                  </div>
                </div>

                {/* Images */}
                {selectedConsultation.images && selectedConsultation.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Uploaded Images</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedConsultation.images.map((image, index) => (
                        <a key={index} href={image} target="_blank" rel="noopener noreferrer">
                          <img
                            src={image}
                            alt={`Skin condition ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Comments */}
                {selectedConsultation.additionalComments && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Additional Comments
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedConsultation.additionalComments}</p>
                    </div>
                  </div>
                )}

                {/* Status Control */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedConsultation._id, 'read')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedConsultation.status === 'read'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      Mark as Read
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedConsultation._id, 'contacted')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedConsultation.status === 'contacted'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      Mark as Contacted
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedConsultation._id, 'resolved')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedConsultation.status === 'resolved'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedConsultation._id, 'closed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedConsultation.status === 'closed'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Priority Control */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Set Priority</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePriority(selectedConsultation._id, 'high')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedConsultation.priority === 'high'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      High
                    </button>
                    <button
                      onClick={() => handleUpdatePriority(selectedConsultation._id, 'medium')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedConsultation.priority === 'medium'
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => handleUpdatePriority(selectedConsultation._id, 'low')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedConsultation.priority === 'low'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Low
                    </button>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Add internal notes about this consultation..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                  <button
                    onClick={() => handleSaveNotes(selectedConsultation._id)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a consultation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

