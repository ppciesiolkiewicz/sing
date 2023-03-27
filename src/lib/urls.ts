
const LANDING_PAGE_PATH = '/';
const BLOG_PATH = '/blog/';

const getLandingPagePath = () => LANDING_PAGE_PATH;
const getBlogPath = () => BLOG_PATH;

const APP_PATH = '/app/';
const APP_DASHBOARD_PATH = APP_PATH;
const APP_PROFILE_PATH = `${APP_PATH}profile/`;
const APP_EXERCISES_PATH = `${APP_PATH}exercises/`;
const APP_EXERCISES_EXERCISE_PATH = `${APP_PATH}/exercise/`;
const APP_CUSTOM_EXERCISES_PATH = `${APP_PATH}exercise-configurator/`;
const APP_LOGOUT_PATH = `${APP_PATH}logout/`;
const APP_VOICE_TUNER_PATH =  `${APP_PATH}voice-tuner/`;

const getAppPath = () => APP_PATH;
const getAppDashboardPath = () => APP_DASHBOARD_PATH;
const getAppExercisesPath = () => APP_EXERCISES_PATH;
const getAppExercisesExercisePath = ({ exerciseId }: { exerciseId: string }) => 
  `${APP_EXERCISES_EXERCISE_PATH}?id=${exerciseId}`;
const getAppCustomExercisesPath = () => APP_CUSTOM_EXERCISES_PATH;
const getAppLogoutPath = () => APP_LOGOUT_PATH;
const getAppProfilePath = () => APP_PROFILE_PATH;
const getAppVoiceTunerPath = () => APP_VOICE_TUNER_PATH

export {
  getLandingPagePath,
  getBlogPath,
  getAppPath,
  getAppDashboardPath,
  getAppExercisesPath,
  getAppExercisesExercisePath,
  getAppCustomExercisesPath,
  getAppLogoutPath,
  getAppProfilePath,
  getAppVoiceTunerPath,
};