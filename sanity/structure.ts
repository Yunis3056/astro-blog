import type {StructureResolver} from 'sanity/structure';

const singletonTypes = new Set(['siteSettings']);

export const structure: StructureResolver = (S) =>
	S.list()
		.id('content')
		.title('内容工作台')
		.items([
			S.documentTypeListItem('post').title('文章'),
			S.documentTypeListItem('note').title('笔记'),
			S.documentTypeListItem('project').title('项目'),
			S.divider(),
			S.documentTypeListItem('topic').title('专题'),
			S.documentTypeListItem('series').title('系列'),
			S.divider(),
			S.listItem()
				.id('siteSettings')
				.title('站点设置')
				.child(S.document().schemaType('siteSettings').documentId('siteSettings')),
		]);

export const singletonActions = (previousActions: any[], context: {schemaType: string}) =>
	singletonTypes.has(context.schemaType)
		? previousActions.filter(({action}) => !['duplicate', 'delete', 'unpublish'].includes(action))
		: previousActions;
