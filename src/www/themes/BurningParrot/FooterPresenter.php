<?php
/**
 * Copyright (c) Enalean, 2016. All Rights Reserved.
 *
 * This file is a part of Tuleap.
 *
 * Tuleap is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Tuleap is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tuleap. If not, see <http://www.gnu.org/licenses/>.
 */

namespace Tuleap\Theme\BurningParrot;

class FooterPresenter
{
    public $javascript_in_footer = array();

    public function __construct(array $javascript_in_footer)
    {
        foreach ($javascript_in_footer as $javascript) {
            if (isset($javascript['file'])) {
                $content    = $javascript['file'];
                $is_snippet = false;
            } else {
                $content    = $javascript['snippet'];
                $is_snippet = true;
            }
            $this->javascript_in_footer[] = new JavascriptPresenter($content, $is_snippet);
        }
    }
}
