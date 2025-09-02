"use client";
import { useState, useEffect } from 'react';
import { Trash2, Search, ChevronUp, ChevronDown, Filter, X } from 'lucide-react';

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for deletion.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the job: <strong>"{jobTitle}"</strong>? This action cannot be undone.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Provide a reason for deletion..."
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={4}
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Job Management Component
const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filters, setFilters] = useState({
    officeType: '',
    type: '',
    location: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null, jobTitle: '', companyEmail: '' });

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/jobs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle both possible response formats
        if (data.success && data.jobs) {
          setJobs(data.jobs);
          setFilteredJobs(data.jobs);
        } else if (Array.isArray(data)) {
          setJobs(data);
          setFilteredJobs(data);
        } else {
          throw new Error('Unexpected API response format');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...jobs];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.company.name.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      );
    }

    // Apply other filters
    if (filters.officeType) {
      result = result.filter(job => job.officeType === filters.officeType);
    }

    if (filters.type) {
      result = result.filter(job => job.type === filters.type);
    }

    if (filters.location) {
      result = result.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
    }

    setFilteredJobs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [jobs, searchTerm, filters]);

  // Sort jobs
  const handleSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedJobs = [...filteredJobs].sort((a, b) => {
      // Handle nested properties
      const aValue = key.includes('.') 
        ? key.split('.').reduce((obj, i) => obj && obj[i], a)
        : a[key];
      
      const bValue = key.includes('.') 
        ? key.split('.').reduce((obj, i) => obj && obj[i], b)
        : b[key];
      
      if (aValue < bValue) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredJobs(sortedJobs);
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    const values = jobs.map(job => 
      key.includes('.') 
        ? key.split('.').reduce((obj, i) => obj && obj[i], job)
        : job[key]
    );
    return [...new Set(values)].filter(value => value);
  };

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      officeType: '',
      type: '',
      location: ''
    });
    setSearchTerm('');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Delete job
  const handleDeleteJob = async (jobId) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      // Remove job from state
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setFilteredJobs(prev => prev.filter(job => job.id !== jobId));
      setDeleteModal({ isOpen: false, jobId: null, jobTitle: '' });
      
    } catch (err) {
      setError(err.message);
      console.error('Error deleting job:', err);
    }
  };

  // Notify the company via email
  const notifyCompany = async (jobId, reason, companyEmail) => {
    try {
      const response = await fetch("/api/jobs/notify-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          reason,
          companyEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to notify company");
      }

      console.log("Company notified successfully");
    } catch (err) {
      setError(err.message);
      console.error("Error notifying company:", err);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = (jobId, reason, companyEmail) => {
    handleDeleteJob(jobId);
    notifyCompany(jobId, reason, companyEmail);
    closeDeleteModal();
  };

  // Open delete confirmation modal
  const openDeleteModal = (jobId, jobTitle, companyEmail) => {
    setDeleteModal({ isOpen: true, jobId, jobTitle, companyEmail });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, jobId: null, jobTitle: '', companyEmail: '' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl text-red-700">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
        <span className="text-sm text-gray-500">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title, company, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.officeType}
            onChange={(e) => handleFilterChange('officeType', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Office Types</option>
            {getUniqueValues('officeType').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Job Types</option>
            {getUniqueValues('type').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {getUniqueValues('location').map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          {(searchTerm || filters.officeType || filters.type || filters.location) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X size={16} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[

                { key: 'title', label: 'Job Title' },
                { key: 'company.name', label: 'Company' },
                { key: 'location', label: 'Location' },
                { key: 'officeType', label: 'Office Type' },
                { key: 'type', label: 'Job Type' },
                { key: 'createdAt', label: 'Posted Date' },
                { key: 'actions', label: 'Actions' }
              ].map(({ key, label }) => (
                <th 
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => key !== 'actions' && handleSort(key)}
                >
                  <div className="flex items-center">
                    {label}
                    {sortConfig.key === key && (
                      sortConfig.direction === 'ascending' 
                        ? <ChevronUp size={16} className="ml-1" /> 
                        : <ChevronDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{job.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.company.name}</div>
                    <div className="text-sm text-gray-500">{job.company.industry}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.officeType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDeleteModal(job.id, job.title)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete job"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No jobs found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded-xl ${
                currentPage === number
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteJob(deleteModal.jobId)}
        jobTitle={deleteModal.jobTitle}
      />
    </div>
  );
};

export default JobManagement;