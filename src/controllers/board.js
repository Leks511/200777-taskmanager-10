import SortComponent from '../components/sort';
import TaskEditComponent from '../components/task-edit';
import TaskComponent from '../components/task';
import TasksComponent from '../components/tasks';
import LoadMoreButtonComponent from '../components/load-more-button';
import NoTasksComponent from '../components/no-tasks';
import {render, replace, remove, RenderPosition} from '../utils/render';

const SHOWING_TASKS_COUNT_BY_BUTTON = 8;
const SHOWING_TASKS_COUNT_ON_START = 8;

const renderTask = (taskListElement, task) => {
  const taskComponent = new TaskComponent(task);
  const taskEditComponent = new TaskEditComponent(task);

  const onEscKeyDown = (evt) => {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

    if (isEscKey) {
      replaceEditToTask();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };

  // Вспомогательные функции замены карточки и формы
  const replaceEditToTask = () => {
    replace(taskComponent, taskEditComponent);
  };

  const replaceTaskToEdit = () => {
    replace(taskEditComponent, taskComponent);
  };


  // По клику на кнопку Edit заменим таск на форму и добавим прослушку ESC
  taskComponent.setEditButtonClickHandler(() => {
    replaceTaskToEdit();
    document.addEventListener(`keydown`, onEscKeyDown);
  });

  // Прослушаем событие отправки и заменим форму на таск
  taskEditComponent.setSubmitHandler(replaceEditToTask);

  render(taskListElement, taskComponent, RenderPosition.BEFOREEND);
};

const renderTasks = (taskListElement, tasks) => {
  tasks.forEach((task) => {
    renderTask(taskListElement, task);
  });
};

export default class BoardController {
  constructor(container) {
    this._container = container;

    this._noTasksComponent = new NoTasksComponent();
    this._sortComponent = new SortComponent();
    this._tasksComponent = new TasksComponent();
    this._loadMoreButtonComponent = new LoadMoreButtonComponent();
  }

  render(tasks) {
    const renderLoadMoreButton = () => {
      if (showingTasksCount >= tasks.length) {
        return;
      }

      render(container, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

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
    // Проверяем, отсутствие тасков
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
    tasks.slice(0, showingTasksCount)
      .forEach((task) => {
        renderTask(taskListElement, task);
      });

    // Отображаем кнопку Load More
    render(container, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

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
