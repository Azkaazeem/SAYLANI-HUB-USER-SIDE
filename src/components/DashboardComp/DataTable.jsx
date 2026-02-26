import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2 } from 'lucide-react';

export default function DataTable({ tableName, title }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: tableData, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    
    if (!error && tableData) {
      setData(tableData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tableName]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (!error) {
      fetchData(); // Refresh data after deletion
    } else {
      alert("Error deleting record.");
    }
  };

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">Loading {title}...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <p className="p-6 text-gray-500 dark:text-gray-400">No data found in {tableName}.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">{key}</th>
                ))}
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  {Object.values(row).map((val, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                      {String(val)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm text-right">
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}