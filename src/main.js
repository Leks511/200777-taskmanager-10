import BoardComponent from './components/board';
import FilterComponent from './components/filter';
import SiteMenuComponent from './components/site-menu';
import SortComponent from './components/sort';
import TaskEditComponent from './components/task-edit';
import TaskComponent from './components/task';
import TasksComponent from './components/tasks';
import LoadMoreButtonComponent from './components/load-more-button';
import NoTasksComponent from './components/no-tasks';
import {generateTasks} from './mock/task';
import {generateFilters} from './mock/filter';
import {render, replace, remove, RenderPosition} from './utils/render';

const SHOWING_TASKS_COUNT_BY_BUTTON = 8;
const SHOWING_TASKS_COUNT_ON_START = 8;
const TASK_COUNT = 22;
const ESC_CODE = 27;

// На каждый таск добавим функционал
const renderTask = (taskListElement, task) => {
  const taskComponent = new TaskComponent(task);
  const taskEditComponent = new TaskEditComponent(task);

  const onEscKeyDown = (evt) => {
    if (evt.keyCode === ESC_CODE) {
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

// Функция рендеринга элементов на доску
const renderBoard = (boardComponent, tasks) => {
  // Проверяем, отсутствие тасков
  const isAllTasksArchived = tasks.every((task) => task.isArchive);

  // Нет тасков - покажем сообщение, есть - добавим интерфейс и покажем таски
  if (isAllTasksArchived) {
    render(boardComponent.getElement(), new NoTasksComponent(), RenderPosition.BEFOREEND);
  } else {
    // Рендерим интерфейсную часть и контейнер для тасков
    render(boardComponent.getElement(), new SortComponent(), RenderPosition.BEFOREEND);
    render(boardComponent.getElement(), new TasksComponent(), RenderPosition.BEFOREEND);

    // Находим контейнер тасков
    const taskListElement = boardComponent.getElement().querySelector(`.board__tasks`);

    // Добавляем сразу туда определённое количество
    let showingTasksCount = SHOWING_TASKS_COUNT_ON_START;
    tasks.slice(0, showingTasksCount)
      .forEach((task) => {
        renderTask(taskListElement, task);
      });

    // Отображаем кнопку Load More
    const loadMoreButtonComponent = new LoadMoreButtonComponent();
    render(boardComponent.getElement(), loadMoreButtonComponent, RenderPosition.BEFOREEND);

    // По нажатию на неё добавляем ещё таски
    loadMoreButtonComponent.setClickHandler(() => {
      const prevTasksCount = showingTasksCount;
      showingTasksCount = showingTasksCount + SHOWING_TASKS_COUNT_BY_BUTTON;

      tasks.slice(prevTasksCount, showingTasksCount)
        .forEach((task) => renderTask(taskListElement, task));

      // Если кончились таски, то удаляем кнопку
      if (showingTasksCount >= tasks.length) {
        remove(loadMoreButtonComponent);
      }
    });
  }
};

// Рендеринг шапки
const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);
render(siteHeaderElement, new SiteMenuComponent(), RenderPosition.BEFOREEND);

// Рендеринг фильтров
const filters = generateFilters();
render(siteMainElement, new FilterComponent(filters), RenderPosition.BEFOREEND);

// Рендеринг доски
const boardComponent = new BoardComponent();
render(siteMainElement, boardComponent, RenderPosition.BEFOREEND);

// Получаем данные тасков
const tasks = generateTasks(TASK_COUNT);

renderBoard(boardComponent, tasks);
