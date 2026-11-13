import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, ListRow, Pill, Text } from '@/components';
import { useTheme } from '@/theme';
import { useAdminPermissions, useAdminRoles, type AdminRole, type Permission } from './api';
import { Loaded, PlatformAdminScreen, plural, RowCard, SectionTitle } from './shared';

function scope(role: AdminRole) {
  if (role.organisation) return <Pill label={role.organisation.name} />;
  return role.isBuiltIn ? <Pill label="Default" tone="brand" /> : <Pill label="Custom" />;
}

function summary(role: AdminRole, total: number) {
  const n = role.permissionCodes.length;
  const perms = total > 0 && n >= total ? 'all permissions' : `${n} of ${total} permissions`;
  return `${plural(role.userCount ?? 0, 'user')} · ${perms}`;
}

/** Roles across the platform and what each one can do (portal: Admin › Roles & permissions). */
export function AdminRoles() {
  const roles = useAdminRoles();
  const permissions = useAdminPermissions();
  const total = permissions.data?.length ?? 0;
  return (
    <PlatformAdminScreen>
      <Loaded query={roles}>
        {() => (
          <RowCard empty="No roles yet.">
            {(roles.data ?? []).map((r, i, all) => (
              <ListRow
                key={r.id}
                title={r.name}
                subtitle={summary(r, total)}
                trailing={scope(r)}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/admin/roles/[id]', params: { id: r.id } })}
              />
            ))}
          </RowCard>
        )}
      </Loaded>
      <Text variant="caption" color="muted">
        Create and edit roles in the FIELD web portal.
      </Text>
    </PlatformAdminScreen>
  );
}

const groupOf = (p: Permission) => p.group || p.category || p.code.split('.')[0] || 'Other';
const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

/** One role's permissions, grouped like the portal's matrix; granted ones are ticked. */
export function AdminRoleDetail({ id }: { id: string }) {
  const roles = useAdminRoles();
  const permissions = useAdminPermissions();
  const { colors } = useTheme();
  const role = roles.data?.find((r) => r.id === id);
  const granted = new Set(role?.permissionCodes ?? []);
  const groups = new Map<string, Permission[]>();
  for (const p of permissions.data ?? []) {
    const g = groupOf(p);
    groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  return (
    <PlatformAdminScreen>
      <Loaded query={roles}>
        {() =>
          role ? (
            <>
              <View style={{ gap: 6 }}>
                <Text variant="section">{role.name}</Text>
                <Text variant="caption" color="muted">
                  {summary(role, permissions.data?.length ?? 0)}
                </Text>
              </View>
              <Loaded query={permissions}>
                {() =>
                  [...groups].map(([group, perms]) => (
                    <View key={group} style={{ gap: 8 }}>
                      <SectionTitle>{title(group)}</SectionTitle>
                      <Card>
                        {perms.map((p) => {
                          const on = granted.has(p.code);
                          return (
                            <View
                              key={p.code}
                              style={{ flexDirection: 'row', gap: 10, paddingVertical: 6 }}
                              accessible
                              accessibilityLabel={`${p.label ?? p.code}: ${on ? 'allowed' : 'not allowed'}`}
                            >
                              <View style={{ width: 18, paddingTop: 2 }}>
                                {on && <Check size={18} color={colors.success} strokeWidth={2.4} />}
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text color={on ? 'ink' : 'faint'}>{p.label ?? p.code}</Text>
                                {p.description ? (
                                  <Text variant="caption" color="muted">
                                    {p.description}
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          );
                        })}
                      </Card>
                    </View>
                  ))
                }
              </Loaded>
            </>
          ) : (
            <Text color="muted">This role no longer exists.</Text>
          )
        }
      </Loaded>
    </PlatformAdminScreen>
  );
}
