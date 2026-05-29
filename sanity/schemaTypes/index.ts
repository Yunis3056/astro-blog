import {note} from './documents/note';
import {post} from './documents/post';
import {project} from './documents/project';
import {series} from './documents/series';
import {siteSettings} from './documents/siteSettings';
import {topic} from './documents/topic';
import {portableText} from './objects/portableText';
import {richImage} from './objects/richImage';

export const schemaTypes = [
	post,
	note,
	project,
	topic,
	series,
	siteSettings,
	richImage,
	portableText,
];
