import SortComponent, {SortType} from '../components/sort';
import TasksComponent from '../components/tasks';
import LoadMoreButtonComponent from '../components/load-more-button';
import NoTasksComponent from '../components/no-tasks';

import TaskController from './task';

import {render, remove, RenderPosition} from '../utils/render';

const SHOWING_TASKS_COUNT_BY_BUTTON = 8;
const SHOWING_TASKS_COUNT_ON_START = 8;


// Функция рендеринга тасков
const renderTasks = (taskListElement, tasks, onDataChange, onViewChange) => {
  return tasks.map((task) => {
    const taskController = new TaskController(taskListElement, onDataChange, onViewChange);
    taskController.render(task);

    return taskController;
  });
};

export default class BoardController {
  constructor(container) {
    this._container = container;

    this._tasks = [];
    this._showedTaskControllers = [];
    this._showingTasksCount = SHOWING_TASKS_COUNT_ON_START;

    this._noTasksComponent = new NoTasksComponent();
    this._sortComponent = new SortComponent();
    this._tasksComponent = new TasksComponent();
    this._loadMoreButtonComponent = new LoadMoreButtonComponent();
  }

  render(tasks) {

    // Функция рендеринга кнопки
    const renderLoadMoreButton = () => {
      // Если кол-во тасков меньше, чем базовое кол-во для показа, то завершим функцию, и кнопка показана не будет
      if (showingTasksCount >= tasks.length) {
        return;
      }

      // Отрендерим кнопку
      render(container, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

      // Повесим обработчик клика на кнопку
      this._loadMoreButtonComponent.setClickHandler(() => {
        const prevTasksCount = showingTasksCount;
        showingTasksCount = showingTasksCount + SHOWING_TASKS_COUNT_BY_BUTTON;

        renderTasks(taskListElement, tasks.slice(prevTasksCount, showingTasksCount));

        if (showingTasksCount >= tasks.length) {
          remove(this._loadMoreButtonComponent);
        }
      });
    };

    const container = this._container.getElement();
    // Проверяем отсутствие тасков
    const isAllTasksArchived = tasks.every((task) => task.isArchive);

    // Нет тасков - покажем сообщение, есть - добавим интерфейс и покажем таски
    if (isAllTasksArchived) {
      render(container, new NoTasksComponent(), RenderPosition.BEFOREEND);
    }

    // Рендерим интерфейсную часть и контейнер для тасков
    render(container, this._sortComponent, RenderPosition.BEFOREEND);
    render(container, this._tasksComponent, RenderPosition.BEFOREEND);

    // Находим контейнер тасков
    const taskListElement = this._tasksComponent.getElement();

    // Добавляем сразу туда определённое количество
    let showingTasksCount = SHOWING_TASKS_COUNT_ON_START;

    renderTasks(taskListElement, tasks.slice(0, showingTasksCount));
    renderLoadMoreButton();

    this._sortComponent.setSortTypeChangeHandler((sortType) => {
      let sortedTasks = [];

      switch (sortType) {
        case SortType.DATE_UP:
          sortedTasks = tasks.slice().sort((a, b) => a.dueDate - b.dueDate);
          break;
        case SortType.DATE_DOWN:
          sortedTasks = tasks.slice().sort((a, b) => b.dueDate - a.dueDate);
          break;
        case SortType.DEFAULT:
          sortedTasks = tasks.slice(0, showingTasksCount);
          break;
      }

      taskListElement.innerHTML = ``;

      renderTasks(taskListElement, sortedTasks);

      // Если сортировка была по дефолту, то отобразим кнопку. Нет - удалим
      if (sortType === SortType.DEFAULT) {
        renderLoadMoreButton();
      } else {
        remove(this._loadMoreButtonComponent);
      }
    });

    // По нажатию на неё добавляем ещё таски
    this._loadMoreButtonComponent.setClickHandler(() => {
      const prevTasksCount = showingTasksCount;
      showingTasksCount = showingTasksCount + SHOWING_TASKS_COUNT_BY_BUTTON;

      tasks.slice(prevTasksCount, showingTasksCount)
        .forEach((task) => renderTask(taskListElement, task));

      // Если кончились таски, то удаляем кнопку
      if (showingTasksCount >= tasks.length) {
        remove(this._loadMoreButtonComponent);
      }
    });
  }
}
