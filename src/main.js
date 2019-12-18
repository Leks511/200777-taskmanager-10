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
import {render, RenderPosition} from './util';

const SHOWING_TASKS_COUNT_BY_BUTTON = 8;
const SHOWING_TASKS_COUNT_ON_START = 8;
const TASK_COUNT = 22;
const ESC_CODE = 27;

// На каждый таск добавим функционал
const renderTask = (taskListElement, task) => {
  const taskComponent = new TaskComponent(task);
  const taskEditComponent = new TaskEditComponent(task);

  const editButton = taskComponent.getElement().querySelector(`.card__btn--edit`);
  const editForm = taskEditComponent.getElement().querySelector(`form`);

  const onEscKeyDown = (evt) => {
    if (evt.keyCode === ESC_CODE) {
      replaceEditToTask();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };


  // Вспомогательные функции замены
  const replaceEditToTask = () => {
    taskListElement.replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
  };

  const replaceTaskToEdit = () => {
    taskListElement.replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
  };

  // По клику на кнопку Edit заменим таск на таск-едит и добавим прослушку ESC
  editButton.addEventListener(`click`, () => {
    replaceTaskToEdit();
    document.addEventListener(`keydown`, onEscKeyDown);
  });

  // Прослушаем событие отправки и заменим таск-едит на таск
  editForm.addEventListener(`submit`, replaceEditToTask);

  render(taskListElement, taskComponent.getElement(), RenderPosition.BEFOREEND);
};

const siteMainElement = document.querySelector(`.main`);

// Рендеринг шапки
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);
render(siteHeaderElement, new SiteMenuComponent().getElement(), RenderPosition.BEFOREEND);

// Рендеринг фильтров
const filters = generateFilters();
render(siteMainElement, new FilterComponent(filters).getElement(), RenderPosition.BEFOREEND);

// Рендеринг доски
const boardComponent = new BoardComponent();
render(siteMainElement, boardComponent.getElement(), RenderPosition.BEFOREEND);

// Получаем данные тасков
const tasks = generateTasks(TASK_COUNT);

// Проверяем, отсутствие тасков
const isAllTasksArchived = tasks.every((task) => task.isArchive);
// Нет тасков - покажем сообщение, есть - добавим интерфейс и покажем таски


if (isAllTasksArchived) {
  render(boardComponent.getElement(), new NoTasksComponent().getElement(), RenderPosition.BEFOREEND);
} else {
  // Рендерим интерфейсную часть и контейнер для тасков
  render(boardComponent.getElement(), new SortComponent().getElement(), RenderPosition.BEFOREEND);
  render(boardComponent.getElement(), new TasksComponent().getElement(), RenderPosition.BEFOREEND);

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
  render(boardComponent.getElement(), loadMoreButtonComponent.getElement(), RenderPosition.BEFOREEND);

  // По нажатию на неё добавляем ещё таски
  loadMoreButtonComponent.getElement().addEventListener(`click`, () => {
    const prevTasksCount = showingTasksCount;
    showingTasksCount = showingTasksCount + SHOWING_TASKS_COUNT_BY_BUTTON;

    tasks.slice(prevTasksCount, showingTasksCount)
      .forEach((task) => renderTask(taskListElement, task));

    // Если кончились таски, то удаляем кнопку
    if (showingTasksCount >= tasks.length) {
      loadMoreButtonComponent.getElement().remove();
      loadMoreButtonComponent.removeElement();
    }
  });
}
