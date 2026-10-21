import {Composition} from 'remotion';
import {MEETINGMANAGER_DEMO, MeetingManagerDemo} from './MeetingManagerDemo';

export const Root: React.FC = () => <Composition id="MeetingManagerDemo" component={MeetingManagerDemo} {...MEETINGMANAGER_DEMO} />;
