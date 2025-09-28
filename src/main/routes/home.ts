import axios from 'axios';
import { Application, Request, Response } from 'express';
import { TypedRequest, TaskFormData } from '../types/task';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export default function (app: Application): void {
  // Helper function to format dates and check if overdue
  const formatTasksWithDates = (tasks: any[]) => {
    const now = new Date();
    return tasks.map(task => ({
      ...task,
      formattedDueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : null,
      isOverdue: task.dueDate ? (new Date(task.dueDate) < now && task.status !== 'COMPLETED') : false
    }));
  };

  // Helper function to format a single task
  const formatSingleTask = (task: any) => {
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const createdAt = new Date(task.createdAt);
    const updatedAt = new Date(task.updatedAt);
    
    return {
      ...task,
      formattedDueDate: dueDate ? dueDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : null,
      formattedCreatedAt: createdAt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      formattedUpdatedAt: updatedAt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOverdue: dueDate ? (dueDate < now && task.status !== 'COMPLETED') : false,
      dueDateDay: dueDate ? dueDate.getDate().toString().padStart(2, '0') : '',
      dueDateMonth: dueDate ? (dueDate.getMonth() + 1).toString().padStart(2, '0') : '',
      dueDateYear: dueDate ? dueDate.getFullYear().toString() : ''
    };
  };

  // Home page - displays all tasks or filtered tasks
  app.get('/', async (req: Request, res: Response) => {
    try {
      // Get tasks and statistics
      const [tasksResponse, statsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/tasks`),
        axios.get(`${BACKEND_URL}/api/tasks/statistics`)
      ]);

      // Also get example case for backward compatibility
      let example = null;
      try {
        const exampleResponse = await axios.get(`${BACKEND_URL}/get-example-case`);
        example = exampleResponse.data;
      } catch (error) {
        // Example case endpoint might not exist, that's okay
        console.log('Example case endpoint not available');
      }

      res.render('home', {
        tasks: formatTasksWithDates(tasksResponse.data),
        statistics: statsResponse.data,
        example: example,
        currentFilter: 'all'
      });
    } catch (error) {
      console.error('Error loading home page:', error);
      res.render('home', {
        error: 'Failed to load tasks. Please try again later.',
        tasks: [],
        statistics: null,
        example: null,
        currentFilter: 'all'
      });
    }
  });

  // Filter tasks by status
  app.get('/tasks/filter/:status', async (req: Request, res: Response) => {
    try {
      const status = req.params.status;
      const [tasksResponse, statsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/tasks/status/${status}`),
        axios.get(`${BACKEND_URL}/api/tasks/statistics`)
      ]);

      res.render('home', {
        tasks: formatTasksWithDates(tasksResponse.data),
        statistics: statsResponse.data,
        example: null,
        currentFilter: status
      });
    } catch (error) {
      console.error(`Error filtering tasks by status ${req.params.status}:`, error);
      res.render('home', {
        error: `Failed to load ${req.params.status} tasks.`,
        tasks: [],
        statistics: null,
        example: null,
        currentFilter: req.params.status
      });
    }
  });

  // Search tasks
  app.get('/tasks/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.redirect('/');
      }

      const [tasksResponse, statsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/tasks/search?query=${encodeURIComponent(query)}`),
        axios.get(`${BACKEND_URL}/api/tasks/statistics`)
      ]);

      res.render('home', {
        tasks: formatTasksWithDates(tasksResponse.data),
        statistics: statsResponse.data,
        example: null,
        currentFilter: 'search',
        searchTerm: query
      });
    } catch (error) {
      console.error('Error searching tasks:', error);
      res.render('home', {
        error: 'Search failed. Please try again.',
        tasks: [],
        statistics: null,
        example: null,
        currentFilter: 'search',
        searchTerm: req.query.q
      });
    }
  });

  // Create task form
  app.get('/tasks/create', (req: Request, res: Response) => {
    res.render('tasks/create', {
      csrfToken: (req as any).csrfToken?.() || 'csrf-token-placeholder'
    });
  });

  // Create task POST
  app.post('/tasks/create', async (req: TypedRequest<TaskFormData>, res: Response) => {
    try {
      const { title, description, status } = req.body;
      const dueDay = req.body['due-date-day'];
      const dueMonth = req.body['due-date-month'];
      const dueYear = req.body['due-date-year'];

      // Validate required fields
      const errors = [];
      if (!title?.trim()) {
        errors.push({ text: 'Title is required', href: '#title' });
      }
      if (!description?.trim()) {
        errors.push({ text: 'Description is required', href: '#description' });
      }

      // Validate and format due date if provided
      let dueDate = null;
      if (dueDay || dueMonth || dueYear) {
        if (!dueDay || !dueMonth || !dueYear) {
          errors.push({ text: 'Please enter a complete due date or leave all fields blank', href: '#due-date-day' });
        } else {
          const dateObj = new Date(parseInt(dueYear), parseInt(dueMonth) - 1, parseInt(dueDay));
          if (dateObj.getDate() != parseInt(dueDay) || dateObj.getMonth() != parseInt(dueMonth) - 1) {
            errors.push({ text: 'Please enter a valid due date', href: '#due-date-day' });
          } else {
            // Check if due date is in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dateObj <= today) {
              errors.push({ text: 'Due date must be in the future', href: '#due-date-day' });
            } else {
              dueDate = dateObj.toISOString();
            }
          }
        }
      }

      if (errors.length > 0) {
        return res.render('tasks/create', {
          errors: errors,
          formData: req.body,
          csrfToken: (req as any).csrfToken?.() || 'csrf-token-placeholder'
        });
      }

      // Create task
      await axios.post(`${BACKEND_URL}/api/tasks`, {
        title: title.trim(),
        description: description.trim(),
        status: status || 'TODO',
        dueDate: dueDate
      });

      res.redirect('/');
    } catch (error) {
      console.error('Error creating task:', error);
      res.render('tasks/create', {
        error: 'Failed to create task. Please try again.',
        formData: req.body,
        csrfToken: (req as any).csrfToken?.() || 'csrf-token-placeholder'
      });
    }
  });

  // View task detail
  app.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const taskResponse = await axios.get(`${BACKEND_URL}/api/tasks/${req.params.id}`);
      res.render('tasks/view', {
        task: formatSingleTask(taskResponse.data),
        csrfToken: (req as any).csrfToken?.() || 'csrf-token-placeholder'
      });
    } catch (error) {
      console.error(`Error loading task ${req.params.id}:`, error);
      if ((error as any).response?.status === 404) {
        res.status(404).render('not-found');
      } else {
        res.render('error', {
          message: 'Failed to load task details'
        });
      }
    }
  });

  // Edit task form
  app.get('/tasks/:id/edit', async (req: Request, res: Response) => {
    try {
      const taskResponse = await axios.get(`${BACKEND_URL}/api/tasks/${req.params.id}`);
      res.render('tasks/edit', {
        task: formatSingleTask(taskResponse.data),
        csrfToken: (req as any).csrfToken?.() || 'csrf-token-placeholder'
      });
    } catch (error) {
      console.error(`Error loading task ${req.params.id} for editing:`, error);
      if ((error as any).response?.status === 404) {
        res.status(404).render('not-found');
      } else {
        res.render('error', {
          message: 'Failed to load task for editing'
        });
      }
    }
  });

  // Update task POST
  app.post('/tasks/:id/edit', async (req: TypedRequest<TaskFormData>, res: Response) => {
    try {
      const { title, description, status } = req.body;
      const dueDay = req.body['due-date-day'];
      const dueMonth = req.body['due-date-month'];
      const dueYear = req.body['due-date-year'];

      // Validate required fields
      const errors = [];
      if (!title?.trim()) {
        errors.push({ text: 'Title is required', href: '#title' });
      }
      if (!description?.trim()) {
        errors.push({ text: 'Description is required', href: '#description' });
      }

      // Validate and format due date if provided
      let dueDate = null;
      if (dueDay || dueMonth || dueYear) {
        if (!dueDay || !dueMonth || !dueYear) {
          errors.push({ text: 'Please enter a complete due date or leave all fields blank', href: '#due-date-day' });
        } else {
          const dateObj = new Date(parseInt(dueYear), parseInt(dueMonth) - 1, parseInt(dueDay));
          if (dateObj.getDate() != parseInt(dueDay) || dateObj.getMonth() != parseInt(dueMonth) - 1) {
            errors.push({ text: 'Please enter a valid due date', href: '#due-date-day' });
          } else {
            // Check if due date is in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dateObj <= today) {
              errors.push({ text: 'Due date must be in the future', href: '#due-date-day' });
            } else {
              dueDate = dateObj.toISOString();
            }
          }
        }
      }

      if (errors.length > 0) {
        // Get task data for re-rendering form
        const taskResponse = await axios.get(`${BACKEND_URL}/api/tasks/${req.params.id}`);
        return res.render('tasks/edit', {
          task: formatSingleTask(taskResponse.data),
          errors: errors,
          formData: req.body,
          csrfToken: (req as any).csrfToken?.() || 'csrf-token-placeholder'
        });
      }

      // Update task
      await axios.put(`${BACKEND_URL}/api/tasks/${req.params.id}`, {
        title: title.trim(),
        description: description.trim(),
        status: status,
        dueDate: dueDate
      });

      res.redirect(`/tasks/${req.params.id}`);
    } catch (error) {
      console.error(`Error updating task ${req.params.id}:`, error);
      try {
        const taskResponse = await axios.get(`${BACKEND_URL}/api/tasks/${req.params.id}`);
        res.render('tasks/edit', {
          task: formatSingleTask(taskResponse.data),
          error: 'Failed to update task. Please try again.',
          formData: req.body,
          csrfToken: (req as any).csrfToken?.() || 'csrf-token-placeholder'
        });
      } catch {
        res.render('error', {
          message: 'Failed to update task'
        });
      }
    }
  });

  // Update task status (quick action)
  app.post('/tasks/:id/status', async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      await axios.patch(`${BACKEND_URL}/api/tasks/${req.params.id}/status`, { status });
      res.redirect(`/tasks/${req.params.id}`);
    } catch (error) {
      console.error(`Error updating task ${req.params.id} status:`, error);
      res.redirect(`/tasks/${req.params.id}`);
    }
  });

  // Delete task
  app.post('/tasks/:id/delete', async (req: Request, res: Response) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/tasks/${req.params.id}`);
      res.redirect('/');
    } catch (error) {
      console.error(`Error deleting task ${req.params.id}:`, error);
      res.redirect(`/tasks/${req.params.id}`);
    }
  });
}
