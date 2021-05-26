/* eslint-disable react/no-array-index-key */

import * as React from 'react';
import moment from 'moment';
import { FormattedMessage, useIntl } from 'react-intl';
import { Tabs, Skeleton, Avatar, Divider } from 'antd';
import { useSiteData } from '../../Home/util';
import './index.less';

interface Author {
  avatar: string;
  href: string;
  type: 'design' | 'develop';
  name: string;
}

interface Article {
  title: string;
  href: string;
  date: string;
  type: 'design' | 'develop';
}

interface Articles {
  author: Author[];
  cn: Article[];
  en: Article[];
}

interface ArticleListProps {
  name: React.ReactNode;
  data: Article[];
}

const ArticleList: React.FC<ArticleListProps> = ({ name, data }) => (
  <td>
    <h4>{name}</h4>
    <ul className="article-list">
      {data.map((article, index) => (
        <li key={index}>
          <a href={article.href} target="_blank" rel="noreferrer">
            <Avatar size="small" />
            <Divider type="vertical" />
            {article.title}
          </a>
        </li>
      ))}
    </ul>
  </td>
);

export default () => {
  const { locale } = useIntl();
  const isZhCN = locale === 'zh-CN';
  const data = useSiteData<Articles>('articles');

  // ========================== Data ==========================
  const mergedData = React.useMemo(() => {
    if (!data) {
      return data;
    }

    const articles = data[isZhCN ? 'cn' : 'en'];
    const yearData: Record<number | string, Record<string, Article[]>> = {};

    articles?.forEach(article => {
      const year = moment(article.date).year();
      yearData[year] = yearData[year] || {};

      yearData[year][article.type] = [...(yearData[year][article.type] || []), article];
    });

    return yearData;
  }, [data]);

  // ========================= Render =========================
  let content: React.ReactNode;

  if (!data) {
    content = <Skeleton active />;
  } else {
    const yearList = Object.keys(mergedData).sort((a, b) => Number(b) - Number(a));

    content = yearList.length ? (
      <Tabs>
        {yearList.map(year => (
          <Tabs.TabPane tab={`${year}${isZhCN ? ' 年' : ''}`} key={year}>
            <table>
              <tbody>
                <tr>
                  <ArticleList
                    name={<FormattedMessage id="app.docs.resource.design" />}
                    data={mergedData[year].design}
                  />
                  <ArticleList
                    name={<FormattedMessage id="app.docs.resource.develop" />}
                    data={mergedData[year].develop}
                  />
                </tr>
              </tbody>
            </table>
          </Tabs.TabPane>
        ))}
      </Tabs>
    ) : null;
  }

  return (
    <div id="articles" className="antd-articles">
      {content}
    </div>
  );
};
