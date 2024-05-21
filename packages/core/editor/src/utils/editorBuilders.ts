import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { createEditor, Editor } from 'slate';
import { YooEditor, YooptaBlockData } from '../editor/types';
import { Plugin, PluginElement, PluginElementsMap } from '../plugins/types';
import { YooptaMark } from '../marks';
import { findPluginBlockBySelectionPath } from '../utils/findPluginBlockBySelectionPath';
import { createBlock } from '../editor/transforms/createBlock';
import { getValue } from '../editor/textFormats/getValue';
import { isActive } from '../editor/textFormats/isActive';
import { toggle } from '../editor/textFormats/toggle';
import { update } from '../editor/textFormats/update';
import { withShortcuts } from '../extensions/shortcuts';
import { getRootBlockElement } from './blockElements';
import { updateBlock } from '../editor/transforms/updateBlock';
import { toggleBlock, ToggleBlockOptions } from '../editor/transforms/toggleBlock';
import { deleteBlock, DeleteBlockOptions } from '../editor/transforms/deleteBlock';
import { updateElement, UpdateElementOptions } from '../editor/elements/updateElement';
import { createBlockElement, CreateBlockElementOptions } from '../editor/elements/createElement';
import { getBlockElement } from '../editor/elements/getElement';
import { DeleteBlockElement, deleteBlockElement } from '../editor/elements/deleteElement';
import { getBlockElementEntry, GetBlockElementEntryOptions } from '../editor/elements/getElementEntry';
import { EmptyBlockElement, isElementEmpty } from '../editor/elements/isElementEmpty';
import { getElementChildren, GetElementChildrenOptions } from '../editor/elements/getElementChildren';

export function buildMarks(editor, marks: YooptaMark<any>[]) {
  const formats: YooEditor['formats'] = {};

  marks.forEach((mark) => {
    const type = mark.type;
    formats[type] = {
      hotkey: mark.hotkey,
      type,
      getValue: () => getValue(editor, type),
      isActive: () => isActive(editor, type),
      toggle: () => toggle(editor, type),
      update: (props) => update(editor, type, props),
    };
  });

  return formats;
}

export function buildBlocks(editor, plugins: Plugin<string, PluginElement<unknown>>[]) {
  const blocks: YooEditor['blocks'] = {};

  plugins.forEach((plugin, index) => {
    const rootBlockElement = getRootBlockElement(plugin.elements);
    const nodeType = rootBlockElement?.props?.nodeType;
    const isInline = nodeType === 'inline' || nodeType === 'inlineVoid';

    if (!isInline) {
      const elements = {};
      Object.keys(plugin.elements).forEach((key) => {
        const { render, ...element } = plugin.elements[key];
        elements[key] = element;
      });

      // Omit fetchers and other non-block related options
      const { display, placeholder, align, shortcuts } = plugin.options || {};

      blocks[plugin.type] = {
        type: plugin.type,
        elements,
        hasCustomEditor: !!plugin.customEditor,
        options: {
          display,
          placeholder,
          align,
          shortcuts,
        },
        isActive: () => {
          const block = findPluginBlockBySelectionPath(editor, { at: editor.selection });
          return block?.type === plugin.type;
        },

        // block actions
        toggle: (options?: ToggleBlockOptions) => toggleBlock(editor, plugin.type, options),
        create: (options) => createBlock(editor, plugin.type, options),
        update: <TKeys extends string, TProps>(id: string, data: Partial<Pick<YooptaBlockData, 'meta' | 'value'>>) => {
          updateBlock(editor, id, data);
        },
        delete: (options: DeleteBlockOptions) => {
          deleteBlock(editor, options);
        },

        // block element actions
        updateElement: <TKeys extends string, TProps>(
          blockId: string,
          elementType: TKeys,
          props: TProps,
          options?: UpdateElementOptions,
        ) => {
          updateElement(editor, blockId, elementType, props, options);
        },
        isElementEmpty: (blockId: string, element: EmptyBlockElement) => {
          return isElementEmpty(editor, blockId, element);
        },
        createElement: <TKeys extends string, TProps>(
          blockId: string,
          elementType: TKeys,
          props: TProps,
          options?: CreateBlockElementOptions,
        ) => {
          createBlockElement(editor, blockId, elementType, props, options);
        },
        getElement: <TKeys extends string>(blockId: string, elementType: TKeys) => {
          return getBlockElement(editor, blockId, elementType);
        },
        getElementEntry: <TKeys extends string>(
          blockId: string,
          elementType: TKeys,
          options?: GetBlockElementEntryOptions,
        ) => {
          return getBlockElementEntry(editor, blockId, elementType, options);
        },
        getElementChildren: (blockId: string, elementType: string, options?: GetElementChildrenOptions) => {
          return getElementChildren(editor, blockId, elementType, options);
        },
        deleteElement: (blockId: string, element: DeleteBlockElement) => {
          deleteBlockElement(editor, blockId, element);
        },
      };
    }
  });

  return blocks;
}

export function buildBlockSlateEditors(editor: YooEditor) {
  const blockEditorsMap = {};

  Object.keys(editor.children).forEach((id) => {
    const slate = buildSlateEditor(editor);
    blockEditorsMap[id] = slate;
  });

  return blockEditorsMap;
}

export function buildSlateEditor(editor: YooEditor): Editor {
  const slate = withShortcuts(editor, withHistory(withReact(createEditor())));
  return slate;
}

export function buildBlockShortcuts(editor: YooEditor) {
  const shortcuts = {};

  Object.values(editor.blocks).forEach((block) => {
    const hasShortcuts =
      block.options && Array.isArray(block.options?.shortcuts) && block.options?.shortcuts.length > 0;

    if (hasShortcuts) {
      block.options?.shortcuts?.forEach((shortcut) => {
        shortcuts[shortcut] = block;
      });
    }
  });

  return shortcuts;
}

// const DEFAULT_PLUGIN_OPTIONS: PluginOptions = {};

export function buildPlugins(
  plugins: Plugin<string, PluginElement<unknown>>[],
): Record<string, Plugin<string, unknown>> {
  const pluginsMap = {};
  const inlineTopLevelPlugins: PluginElementsMap<string, any> = {};

  plugins.forEach((plugin) => {
    if (plugin.elements) {
      Object.keys(plugin.elements).forEach((type) => {
        const element = plugin.elements[type];
        const nodeType = element.props?.nodeType;

        if (nodeType === 'inline' || nodeType === 'inlineVoid') {
          inlineTopLevelPlugins[type] = element;
        }
      });
    }

    pluginsMap[plugin.type] = plugin;
  });

  plugins.forEach((plugin) => {
    if (plugin.elements) {
      const elements = { ...plugin.elements, ...inlineTopLevelPlugins };
      pluginsMap[plugin.type] = { ...plugin, elements };
    }
  });

  return pluginsMap;
}
