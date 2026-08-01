
import {
  getCategoricalSchemeRegistry,
  isFeatureEnabled,
  FeatureFlag,
} from '@zobi-ui/core';
import getOwnerName from 'src/utils/getOwnerName';
import { Avatar, AvatarGroup, Tooltip } from '@zobi-ui/core/components';
import { ensureAppRoot } from 'src/utils/pathUtils';
import { getRandomColor } from './utils';
import type { FacePileProps } from './types';

const colorList = getCategoricalSchemeRegistry().get()?.colors ?? [];

export function FacePile({ users, maxCount = 4 }: FacePileProps) {
  return (
    <AvatarGroup max={{ count: maxCount }}>
      {users.map(user => {
        const { first_name, last_name, id } = user;
        const name = getOwnerName(user);
        const uniqueKey = `${id}-${first_name}-${last_name}`;
        const color = getRandomColor(uniqueKey, colorList);
        const avatarUrl = isFeatureEnabled(FeatureFlag.SlackEnableAvatars)
          ? ensureAppRoot(`/api/v1/user/${id}/avatar.png`)
          : undefined;
        return (
          <Tooltip key={name} title={name} placement="top">
            <Avatar
              key={name}
              style={{
                backgroundColor: color,
                borderColor: color,
              }}
              src={avatarUrl}
            >
              {first_name?.[0]?.toLocaleUpperCase()}
              {last_name?.[0]?.toLocaleUpperCase()}
            </Avatar>
          </Tooltip>
        );
      })}
    </AvatarGroup>
  );
}

export type { FacePileProps };
