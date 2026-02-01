import React from 'react';
import Button from '../common/Button';

const CreateTaskModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-brand-blue p-6 text-white">
          <h3 className="text-xl font-bold">Create New Task</h3>
          <p className="text-blue-100 text-sm">Assign work to your team members.</p>
        </div>

        <form className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="e.g., Design API Schema" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Assignee</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none">
                <option>Select Member</option>
                <option>Sara Tekle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea rows="3" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="Details about the task..."></textarea>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Create Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;