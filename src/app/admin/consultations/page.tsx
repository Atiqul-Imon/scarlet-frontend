"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Mail, Phone, Clock, CheckCircle, 
  XCircle, Trash2, User, Calendar, AlertCircle,
  MessageSquare, UserCheck, AlertOctagon, MapPin,
  Image as ImageIcon, FileText, Activity
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/context';
import Image from 'next/image';

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
  const [adminNotes, setAdminNotes] = useState('');
  const [imageModal, setImageModal] = useState<string | null>(null);

  // Check authentication
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadConsultations();
    loadStats();
  }, [statusFilter, searchTerm]);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const response = await adminApi.consultations.getConsultations({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        page: 1,
        limit: 100
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
      await adminApi.consultations.updateStatus(id, status);
      loadConsultations();
      loadStats();
      if (selectedConsultation?._id === id) {
        setSelectedConsultation({ ...selectedConsultation, status });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedConsultation) return;
    try {
      await adminApi.consultations.updateConsultation(selectedConsultation._id, { adminNotes });
      loadConsultations();
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return;
    try {
      await adminApi.consultations.deleteConsultation(id);
      setSelectedConsultation(null);
      loadConsultations();
      loadStats();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      read: 'bg-blue-100 text-blue-800 border-blue-200',
      contacted: 'bg-purple-100 text-purple-800 border-purple-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      read: <Eye className="w-4 h-4" />,
      contacted: <Phone className="w-4 h-4" />,
      resolved: <CheckCircle className="w-4 h-4" />,
      closed: <XCircle className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Skincare Consultations</h1>
          <p className="text-gray-600">Manage and respond to customer skincare consultation requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{stats.read}</div>
            <div className="text-sm text-gray-600">Read</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600">{stats.contacted}</div>
            <div className="text-sm text-gray-600">Contacted</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-500">
            <div className="text-3xl font-bold text-gray-600">{stats.closed}</div>
            <div className="text-sm text-gray-600">Closed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone, or problem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="read">Read</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultations List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="font-bold text-white text-lg">Consultations ({consultations.length})</h2>
            </div>
            <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Activity className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading consultations...</p>
                </div>
              ) : consultations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No consultations found</p>
                </div>
              ) : (
                consultations.map((consultation) => (
                  <div
                    key={consultation._id}
                    onClick={() => {
                      setSelectedConsultation(consultation);
                      setAdminNotes(consultation.adminNotes || '');
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-all ${
                      selectedConsultation?._id === consultation._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{consultation.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-1">{consultation.mainProblem}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">{consultation.age}y</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">{consultation.skinType}</span>
                          {consultation.images && consultation.images.length > 0 && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {consultation.images.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(consultation.status)}`}>
                        {getStatusIcon(consultation.status)}
                        {consultation.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(consultation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedConsultation ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
                  <h2 className="font-bold text-white text-lg">Consultation Details</h2>
                  <button
                    onClick={() => handleDelete(selectedConsultation._id)}
                    className="text-white hover:text-red-200 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 max-h-[calc(100vh-24rem)] overflow-y-auto space-y-6">
                  {/* Status Actions */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedConsultation._id, 'read')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Mark as Read
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedConsultation._id, 'contacted')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        Mark as Contacted
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedConsultation._id, 'resolved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedConsultation._id, 'closed')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 font-medium">Name</label>
                        <p className="text-gray-900 font-medium">{selectedConsultation.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium">Age</label>
                        <p className="text-gray-900 font-medium">{selectedConsultation.age} years</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Phone
                        </label>
                        <a href={`tel:${selectedConsultation.phone}`} className="text-blue-600 font-medium hover:underline">
                          {selectedConsultation.phone}
                        </a>
                      </div>
                      {selectedConsultation.email && (
                        <div>
                          <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email
                          </label>
                          <a href={`mailto:${selectedConsultation.email}`} className="text-blue-600 font-medium hover:underline break-all">
                            {selectedConsultation.email}
                          </a>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Address
                        </label>
                        <p className="text-gray-900">{selectedConsultation.address}</p>
                      </div>
                      {selectedConsultation.gender && (
                        <div>
                          <label className="text-xs text-gray-500 font-medium">Gender</label>
                          <p className="text-gray-900 capitalize">{selectedConsultation.gender}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-gray-500 font-medium">Preferred Contact</label>
                        <p className="text-gray-900 capitalize">{selectedConsultation.preferredContactMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skin Information */}
                  <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      Skin Condition & Problem
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-orange-700 font-medium">Skin Type</label>
                        <p className="text-gray-900 font-medium capitalize">{selectedConsultation.skinType}</p>
                      </div>
                      <div>
                        <label className="text-xs text-orange-700 font-medium">Main Problem</label>
                        <p className="text-gray-900 font-medium">{selectedConsultation.mainProblem}</p>
                      </div>
                      <div>
                        <label className="text-xs text-orange-700 font-medium">Problem Duration</label>
                        <p className="text-gray-900">{selectedConsultation.problemDuration}</p>
                      </div>
                      {selectedConsultation.currentProducts && (
                        <div>
                          <label className="text-xs text-orange-700 font-medium">Current Products</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedConsultation.currentProducts}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  {selectedConsultation.images && selectedConsultation.images.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                        Uploaded Images ({selectedConsultation.images.length})
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedConsultation.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div 
                              className="relative w-full h-32 bg-white rounded-lg overflow-hidden border-2 border-purple-200 hover:border-purple-500 transition-all cursor-pointer"
                              onClick={() => setImageModal(imageUrl)}
                            >
                              <img
                                src={imageUrl}
                                alt={`Skin condition ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/placeholders/no-image.png';
                                  target.onerror = null;
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <p className="text-xs text-center text-gray-600 mt-1">Image {index + 1}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Comments */}
                  {selectedConsultation.additionalComments && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Additional Comments
                      </h3>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedConsultation.additionalComments}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-yellow-600" />
                      Admin Notes
                    </h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add your notes here..."
                      className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 min-h-[100px] bg-white text-gray-900"
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="mt-3 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                    >
                      Save Notes
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Created: {new Date(selectedConsultation.createdAt).toLocaleString()}</span>
                      <span>Updated: {new Date(selectedConsultation.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Consultation Selected</h3>
                  <p className="text-gray-600">Select a consultation from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setImageModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-lg font-bold"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img
              src={imageModal}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholders/no-image.png';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
