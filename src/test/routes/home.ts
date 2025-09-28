import { app } from '../../main/app';
import { expect } from 'chai';
import request from 'supertest';
import nock from 'nock';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

describe('Task Management Routes', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Home page (GET /)', () => {
    test('should return home page with tasks and statistics when backend is available', async () => {
      // Mock backend responses
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'TODO',
          dueDate: '2024-12-31T10:00:00Z',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      ];
      const mockStatistics = {
        totalTasks: 1,
        todoTasks: 1,
        inProgressTasks: 0,
        completedTasks: 0,
        cancelledTasks: 0,
        overdueTasks: 0
      };

      nock(BACKEND_URL)
        .get('/api/tasks')
        .reply(200, mockTasks);

      nock(BACKEND_URL)
        .get('/api/tasks/statistics')
        .reply(200, mockStatistics);

      nock(BACKEND_URL)
        .get('/get-example-case')
        .reply(404); // Example case not found

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).to.contain('Task Management System');
      expect(response.text).to.contain('Test Task');
    });

    test('should handle backend error gracefully', async () => {
      nock(BACKEND_URL)
        .get('/api/tasks')
        .reply(500, { error: 'Internal Server Error' });

      nock(BACKEND_URL)
        .get('/api/tasks/statistics')
        .reply(500, { error: 'Internal Server Error' });

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).to.contain('Failed to load tasks');
    });
  });

  describe('Filter tasks (GET /tasks/filter/:status)', () => {
    test('should filter tasks by status', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Completed Task',
          description: 'Test Description',
          status: 'COMPLETED',
          dueDate: null,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      ];
      const mockStatistics = {
        totalTasks: 1,
        todoTasks: 0,
        inProgressTasks: 0,
        completedTasks: 1,
        cancelledTasks: 0,
        overdueTasks: 0
      };

      nock(BACKEND_URL)
        .get('/api/tasks/status/COMPLETED')
        .reply(200, mockTasks);

      nock(BACKEND_URL)
        .get('/api/tasks/statistics')
        .reply(200, mockStatistics);

      const response = await request(app)
        .get('/tasks/filter/COMPLETED')
        .expect(200);

      expect(response.text).to.contain('Completed Task');
    });
  });

  describe('Search tasks (GET /tasks/search)', () => {
    test('should search tasks with query parameter', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Search Result Task',
          description: 'Found this task',
          status: 'TODO',
          dueDate: null,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      ];
      const mockStatistics = {
        totalTasks: 1,
        todoTasks: 1,
        inProgressTasks: 0,
        completedTasks: 0,
        cancelledTasks: 0,
        overdueTasks: 0
      };

      nock(BACKEND_URL)
        .get('/api/tasks/search')
        .query({ query: 'test' })
        .reply(200, mockTasks);

      nock(BACKEND_URL)
        .get('/api/tasks/statistics')
        .reply(200, mockStatistics);

      const response = await request(app)
        .get('/tasks/search?q=test')
        .expect(200);

      expect(response.text).to.contain('Search Result Task');
    });

    test('should redirect to home if no search query provided', async () => {
      await request(app)
        .get('/tasks/search')
        .expect(302)
        .expect('Location', '/');
    });
  });

  describe('Create task form (GET /tasks/create)', () => {
    test('should return create task form', async () => {
      const response = await request(app)
        .get('/tasks/create')
        .expect(200);

      expect(response.text).to.contain('Create New Task');
      expect(response.text).to.contain('form');
    });
  });

  describe('Create task (POST /tasks/create)', () => {
    test('should create task successfully', async () => {
      nock(BACKEND_URL)
        .post('/api/tasks', {
          title: 'New Task',
          description: 'Task description',
          status: 'TODO',
          dueDate: null
        })
        .reply(201, { id: 1, title: 'New Task' });

      await request(app)
        .post('/tasks/create')
        .send({
          title: 'New Task',
          description: 'Task description',
          status: 'TODO'
        })
        .expect(302)
        .expect('Location', '/');
    });

    test('should show validation errors for missing title', async () => {
      const response = await request(app)
        .post('/tasks/create')
        .send({
          description: 'Task description',
          status: 'TODO'
        })
        .expect(200);

      expect(response.text).to.contain('Title is required');
    });

    test('should show validation errors for missing description', async () => {
      const response = await request(app)
        .post('/tasks/create')
        .send({
          title: 'New Task',
          status: 'TODO'
        })
        .expect(200);

      expect(response.text).to.contain('Description is required');
    });

    test('should handle incomplete due date', async () => {
      const response = await request(app)
        .post('/tasks/create')
        .send({
          title: 'New Task',
          description: 'Task description',
          status: 'TODO',
          'due-date-day': '15',
          'due-date-month': '12'
          // Missing year
        })
        .expect(200);

      expect(response.text).to.contain('Please enter a complete due date');
    });
  });

  describe('View task (GET /tasks/:id)', () => {
    test('should return task details', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO',
        dueDate: '2024-12-31T10:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      nock(BACKEND_URL)
        .get('/api/tasks/1')
        .reply(200, mockTask);

      const response = await request(app)
        .get('/tasks/1')
        .expect(200);

      expect(response.text).to.contain('Test Task');
      expect(response.text).to.contain('Test Description');
    });

    test('should return 404 for non-existent task', async () => {
      nock(BACKEND_URL)
        .get('/api/tasks/999')
        .reply(404);

      await request(app)
        .get('/tasks/999')
        .expect(404);
    });
  });

  describe('Edit task form (GET /tasks/:id/edit)', () => {
    test('should return edit form with task data', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO',
        dueDate: '2024-12-31T10:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      nock(BACKEND_URL)
        .get('/api/tasks/1')
        .reply(200, mockTask);

      const response = await request(app)
        .get('/tasks/1/edit')
        .expect(200);

      expect(response.text).to.contain('Edit Task');
      expect(response.text).to.contain('Test Task');
    });
  });

  describe('Update task (POST /tasks/:id/edit)', () => {
    test('should update task successfully', async () => {
      nock(BACKEND_URL)
        .put('/api/tasks/1', {
          title: 'Updated Task',
          description: 'Updated description',
          status: 'IN_PROGRESS',
          dueDate: null
        })
        .reply(200, { id: 1, title: 'Updated Task' });

      await request(app)
        .post('/tasks/1/edit')
        .send({
          title: 'Updated Task',
          description: 'Updated description',
          status: 'IN_PROGRESS'
        })
        .expect(302)
        .expect('Location', '/tasks/1');
    });
  });

  describe('Update task status (POST /tasks/:id/status)', () => {
    test('should update task status successfully', async () => {
      nock(BACKEND_URL)
        .patch('/api/tasks/1/status', { status: 'COMPLETED' })
        .reply(200);

      await request(app)
        .post('/tasks/1/status')
        .send({ status: 'COMPLETED' })
        .expect(302)
        .expect('Location', '/tasks/1');
    });
  });

  describe('Delete task (POST /tasks/:id/delete)', () => {
    test('should delete task successfully', async () => {
      nock(BACKEND_URL)
        .delete('/api/tasks/1')
        .reply(200);

      await request(app)
        .post('/tasks/1/delete')
        .expect(302)
        .expect('Location', '/');
    });
  });
});
