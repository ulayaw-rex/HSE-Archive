import type { Plugin, RenderViewer } from "@react-pdf-viewer/core";

export interface PageThumbnailPluginProps {
  PageThumbnail: React.ReactElement;
}

export const pageThumbnailPlugin = (
  props: PageThumbnailPluginProps
): Plugin => {
  const { PageThumbnail } = props;

  return {
    renderViewer: (renderProps: RenderViewer) => {
      const { slot } = renderProps;

      // Replace the viewer content with the thumbnail
      slot.children = PageThumbnail;

      // Reset the sub slot safely
      if (slot.subSlot) {
        slot.subSlot.attrs = {};
        slot.subSlot.children = <></>;
      }

      return slot;
    },
  };
};
