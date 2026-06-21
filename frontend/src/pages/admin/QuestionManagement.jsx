/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useForm, useFieldArray } from 'react-hook-form';

const QuestionForm = ({ question, onSuccess, onCancel }) => {
  const { register, control, handleSubmit } = useForm({
    defaultValues: question || {
      text: '',
      difficulty: 'medium',
      category: 'General',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Need exactly one correct option in UI
      const hasCorrect = data.options.some(o => o.isCorrect);
      if (!hasCorrect) {
        toast.error("At least one option must be marked correct.");
        setLoading(false);
        return;
      }

      if (question?.id) {
        await api.put(`/questions/${question.id}`, data);
        toast.success("Question updated successfully");
      } else {
        await api.post('/questions', data);
        toast.success("Question created successfully");
      }
      onSuccess();
    } catch (error) { console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{question ? 'Edit Question' : 'Add New Question'}</h2>
        <button onClick={onCancel} aria-label="Close Form" className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><X size={24} /></button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Question Text" 
          placeholder="What is..." 
          {...register('text', { required: true })} 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
            <select 
              {...register('difficulty')} 
              className="w-full px-4 py-2 bg-white/50 dark:bg-surface-dark/50 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <Input 
            label="Category" 
            placeholder="Math, Logic..." 
            {...register('category')} 
          />
        </div>

        <div className="space-y-3 mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Options</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4">
              <input 
                type="radio" 
                {...register(`options.${index}.isCorrect`)}
                value={true}
                className="w-5 h-5 text-primary-600"
              />
              <Input 
                placeholder={`Option ${index + 1}`} 
                aria-label={`Option ${index + 1}`}
                {...register(`options.${index}.text`, { required: true })} 
                className="flex-1"
              />
              {index > 1 && (
                <button type="button" aria-label="Remove Option" onClick={() => remove(index)} className="text-red-500 p-2"><Trash2 size={18} /></button>
              )}
            </div>
          ))}
          {fields.length < 5 && (
            <Button type="button" variant="secondary" onClick={() => append({ text: '', isCorrect: false })} className="text-sm">
              + Add Option
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Question'}</Button>
        </div>
      </form>
    </GlassCard>
  );
};

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchQuestions = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await api.get('/questions');
      setQuestions(data.data || []);
    } catch (error) { console.error(error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(false);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/questions/${id}`);
        toast.success("Question deleted");
        fetchQuestions();
      } catch (error) { console.error(error);
        toast.error("Failed to delete question");
      }
    }
  };

  const handleEdit = (q) => {
    setEditingQuestion(q);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        {!isFormOpen && (
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus size={18} /> Add Question
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <QuestionForm 
          question={editingQuestion} 
          onSuccess={() => { setIsFormOpen(false); fetchQuestions(); }}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <GlassCard className="p-6">
          <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 mb-6">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search questions by text or category..."
              className="w-full bg-transparent border-none focus:outline-none ml-3 text-slate-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="flex justify-between items-center p-4 bg-white/40 dark:bg-surface-dark/40 rounded-xl border border-slate-200 dark:border-white/10">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 dark:text-white mb-1">{q.text}</p>
                    <div className="flex gap-3 text-sm">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">{q.category}</span>
                      <span className="text-slate-500 capitalize px-2 bg-slate-200 dark:bg-slate-700 rounded text-xs py-0.5">{q.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(q)} aria-label="Edit Question" className="p-2 text-slate-500 hover:text-primary-500 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(q.id)} aria-label="Delete Question" className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  No questions found.
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default QuestionManagement;
