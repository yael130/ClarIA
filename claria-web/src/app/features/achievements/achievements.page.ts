import { Component, inject } from '@angular/core';

import { MockDataService } from '../../core/services/mock-data.service';

/** Insignias obtenidas y pendientes del estudiante. */
@Component({
  templateUrl: './achievements.page.html',
})
export class AchievementsPage {
  protected readonly badges = inject(MockDataService).badges;
}
