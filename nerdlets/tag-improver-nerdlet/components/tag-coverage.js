import React from 'react';
import PropTypes from 'prop-types';

import {
  Dropdown,
  DropdownSection,
  DropdownItem,
  Grid,
  GridItem,
  HeadingText
} from 'nr1';

import { ENFORCEMENT_PRIORITY } from '../tag-schema';

import TagTable from './tag-table';
import TagValueTable from './tag-value-table';

export default class TagCoverageView extends React.Component {
  static propTypes = {
    entityCount: PropTypes.number,
    tagHierarchy: PropTypes.object,
    taggingPolicy: PropTypes.array,
    getTagKeys: PropTypes.object,
    height: PropTypes.number
  };

  state = {
    currentTagGroup: 'account' // NOTE: this will always be present
  };

  updateCurrentTagGroup = currentTagGroup => {
    this.setState({ currentTagGroup });
  };

  getSortedTagKeys = tags => {
    return tags.sort((a, b) => {
      const pa = a.enforcementPriority || 99;
      const pb = b.enforcementPriority || 99;
      if (pa < pb) return 1;
      if (pa > pb) return -1;
      return a.tagKey.localeCompare(b.tagKey, undefined, {
        sensitivity: 'base'
      });
    });
  };

  getTagTableData = () => {
    const { entityCount, tagHierarchy, taggingPolicy } = this.props;
    const { getSortedTagKeys } = this;

    return getSortedTagKeys(
      Object.keys(tagHierarchy).map(k => {
        const count = Object.keys(tagHierarchy[k]).reduce(
          (acc, v) => acc + tagHierarchy[k][v].length,
          0
        );
        const coverage = Math.floor((count * 100) / entityCount);
        const enforcement =
          (taggingPolicy.find(schema => schema.key === k) || {}).enforcement ||
          'Non-Policy';
        const enforcementPriority = enforcement
          ? ENFORCEMENT_PRIORITY[enforcement]
          : -1;

        return {
          tagKey: k,
          enforcement: enforcement,
          enforcementPriority: enforcementPriority,
          cardinality: Object.keys(tagHierarchy[k]).length,
          entityCount: count,
          entityPercent: coverage
        };
      })
    );
  };

  getValueTableData = () => {
    const { tagHierarchy } = this.props;
    const { currentTagGroup } = this.state;
    if (!tagHierarchy[currentTagGroup]) return [];

    return Object.keys(tagHierarchy[currentTagGroup]).map(v => {
      return {
        tagValue: v,
        entityCount: tagHierarchy[currentTagGroup][v].length
      };
    });
  };

  render() {
    const { getTagTableData, getValueTableData, updateCurrentTagGroup } = this;
    const { tagHierarchy } = this.props;
    const tagKeys = this.props.getTagKeys;
    const { currentTagGroup } = this.state;
    const currentTagGroupIsPopulated =
      tagHierarchy[currentTagGroup] &&
      Object.keys(tagHierarchy[currentTagGroup]).length > 0;

    return (
      <div
        className="split"
        style={{ height: (this.props.height || 1200) - 120 }}
      >
        <Grid className="primary-grid" style={{ alignContent: 'start' }}>
          <GridItem className="primary-content-container" columnSpan={7}>
            <HeadingText type={HeadingText.TYPE.HEADING_4}>
              Tags in use
            </HeadingText>
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={1}>
            <></>
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={4}>
            <HeadingText type={HeadingText.TYPE.HEADING_4}>
              Tag
              <Dropdown
                title={currentTagGroup}
                items={tagKeys}
                style={{
                  display: 'inline-block',
                  margin: '0 .5em',
                  verticalAlign: 'middle'
                }}
                sectioned
              >
                {({ item: section, index }) => (
                  <DropdownSection
                    key={index}
                    title={section.title}
                    items={section.items}
                  >
                    {({ item, index }) => (
                      <DropdownItem
                        key={`d-${index}`}
                        onClick={() => updateCurrentTagGroup(item)}
                      >
                        {item}
                      </DropdownItem>
                    )}
                  </DropdownSection>
                )}
              </Dropdown>
              breakdown
            </HeadingText>
          </GridItem>

          <GridItem className="primary-content-container" columnSpan={12}>
            <hr />
          </GridItem>

          <GridItem className="primary-content-container" columnSpan={7}>
            <div className="left">
              <TagTable
                getTableData={() => getTagTableData()}
                selectTag={tagKey => updateCurrentTagGroup(tagKey)}
              />
            </div>
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={1}>
            <></>
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={4}>
            {currentTagGroupIsPopulated ? (
              <div className="right">
                <TagValueTable getTableData={() => getValueTableData()} />
              </div>
            ) : (
              <></>
            )}
          </GridItem>
        </Grid>
      </div>
    );
  }
}
