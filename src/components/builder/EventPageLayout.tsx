'use client';

import { BuilderBlocks } from '@builder.io/react';

interface EventPageLayoutProps {
  // Event Header fields (for 9-column)
  image?: string;
  name?: string;
  publishedDate?: string | Date;
  // Sidebar fields (for 3-column)
  address?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  organizerName?: string;
  organizerPhone?: string;
  organizerWebsite?: string;
  joinButtonText?: string;
  joinButtonUrl?: string;
  // Builder blocks for content slots
  mainContent?: any[];
  sidebarContent?: any[];
  // Builder block reference (passed automatically by Builder.io)
  builderBlock?: any;
}

export function EventPageLayout({
  // Event Header fields
  image = '/images/dummy-img-900x600.jpg',
  name = 'English Day on Carfree day',
  publishedDate = '2016-03-19',
  // Sidebar fields
  address = '99 S.t Jomblo Park Pekanbaru 28292. Indonesia',
  startTime = '2016-07-16T11:00:00',
  endTime = '2016-07-29T16:00:00',
  organizerName = 'Max Organizer',
  organizerPhone = '074574217447',
  organizerWebsite = 'http://www.website.com',
  joinButtonText = 'JOIN',
  joinButtonUrl = '#',
  // Builder blocks
  mainContent = [],
  sidebarContent = [],
  builderBlock,
}: EventPageLayoutProps) {
  const publishedDateLabel = (() => {
    if (!publishedDate) return '';
    const date = publishedDate instanceof Date ? publishedDate : new Date(publishedDate);
    if (Number.isNaN(date.getTime())) return typeof publishedDate === 'string' ? publishedDate : '';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  })();

  const startTimeLabel = (() => {
    if (!startTime) return '';
    const date = startTime instanceof Date ? startTime : new Date(startTime);
    if (Number.isNaN(date.getTime())) return typeof startTime === 'string' ? startTime : '';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  })();

  const endTimeLabel = (() => {
    if (!endTime) return '';
    const date = endTime instanceof Date ? endTime : new Date(endTime);
    if (Number.isNaN(date.getTime())) return typeof endTime === 'string' ? endTime : '';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  })();

  return (
    <div className="section">
      <div className="content-wrap">
        <div className="container">
          <div className="row">
            {/* 9-Column Section */}
            <div className="col-sm-12 col-md-12 col-lg-9">
              {/* Default Event Header */}
              <div className="single-news">
                <img src={image} alt={name} className="img-fluid rounded" />
                <div className="spacer-30"></div>
                <h2 className="title">{name}</h2>
                <div className="meta-date">{publishedDateLabel}</div>
                <div className="spacer-30"></div>
              </div>
              {/* Droppable content slot for 9-column using BuilderBlocks (Gen 1) */}
              <BuilderBlocks
                parentElementId={builderBlock?.id}
                dataPath="component.options.mainContent"
                blocks={mainContent}
              />
            </div>

            {/* 3-Column Section */}
            <div className="col-sm-12 col-md-12 col-lg-3">
              {/* Default Event Sidebar */}
              <div className="events-widget">
                <div className="widget-title">Venue</div>
                <dl>
                  <dt>{address}</dt>
                </dl>

                <div className="widget-title">Detail</div>
                <dl>
                  <dt>Start:</dt>
                  <dd>{startTimeLabel}</dd>
                  <dt>End:</dt>
                  <dd>{endTimeLabel}</dd>
                </dl>

                <div className="widget-title">Organizer</div>
                <dl>
                  <dt>{organizerName}</dt>
                  <dt>Phone:</dt>
                  <dd>{organizerPhone}</dd>
                  <dt>Website:</dt>
                  <dd>
                    <a href={organizerWebsite} target="_blank" rel="noopener noreferrer">
                      {organizerWebsite}
                    </a>
                  </dd>
                </dl>
                <div className="spacer-30"></div>
                <a href={joinButtonUrl} className="btn btn-primary btn-block">
                  {joinButtonText}
                </a>
                <div className="spacer-30"></div>
              </div>
              {/* Droppable content slot for 3-column using BuilderBlocks (Gen 1) */}
              <BuilderBlocks
                parentElementId={builderBlock?.id}
                dataPath="component.options.sidebarContent"
                blocks={sidebarContent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const eventPageLayoutInfo = {
  name: 'EventPageLayout',
  friendlyName: 'Event Page Layout (9-3)',
  canHaveChildren: true,
  inputs: [
    // Event Header inputs
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'webp'],
      defaultValue: '/images/dummy-img-900x600.jpg',
      helperText: 'Event image (recommended size: 900x600px)',
    },
    {
      name: 'name',
      type: 'string',
      defaultValue: 'English Day on Carfree day',
      helperText: 'Event name/title',
    },
    {
      name: 'publishedDate',
      type: 'date',
      defaultValue: '2016-03-19',
      helperText: 'Published date',
    },
    // Sidebar inputs
    {
      name: 'address',
      type: 'longText',
      defaultValue: '99 S.t Jomblo Park Pekanbaru 28292. Indonesia',
      helperText: 'Venue address',
    },
    {
      name: 'startTime',
      type: 'date',
      defaultValue: Date.now(),
      helperText: 'Event start date/time',
    },
    {
      name: 'endTime',
      type: 'date',
      defaultValue: Date.now(),
      helperText: 'Event end date/time',
    },
    {
      name: 'organizerName',
      type: 'string',
      defaultValue: 'Max Organizer',
      helperText: 'Organizer name',
    },
    {
      name: 'organizerPhone',
      type: 'string',
      defaultValue: '074574217447',
      helperText: 'Organizer phone number',
    },
    {
      name: 'organizerWebsite',
      type: 'url',
      defaultValue: 'http://www.website.com',
      helperText: 'Organizer website URL',
    },
    {
      name: 'joinButtonText',
      type: 'string',
      defaultValue: 'JOIN',
      helperText: 'Text for the join button',
    },
    {
      name: 'joinButtonUrl',
      type: 'url',
      defaultValue: '#',
      helperText: 'URL for the join button',
    },
    // Content slots - using 'blocks' type for Gen 1
    {
      name: 'mainContent',
      type: 'blocks',
      hideFromUI: true,
      defaultValue: [],
    },
    {
      name: 'sidebarContent',
      type: 'blocks',
      hideFromUI: true,
      defaultValue: [],
    },
  ],
};

export default EventPageLayout;
