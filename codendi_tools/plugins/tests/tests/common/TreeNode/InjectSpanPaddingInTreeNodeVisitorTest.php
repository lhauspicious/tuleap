<?php
/**
 * Copyright (c) Enalean, 2012. All Rights Reserved.
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

require_once 'common/TreeNode/InjectSpanPaddingInTreeNodeVisitor.class.php';
require_once dirname(__FILE__).'/InjectSpanPadding.class.php';

class TreeNode_InjectSpanPaddingInTreeNodeVisitorTest extends InjectSpanPadding {

    protected $treeNode;
    /**
     * Return this Tree
     * 
     * ROOT
     * |
     * +-Child 1
     * 	 |
     * 	 '-Child 2
     * 
     */
    protected function given_AParentWithOneChildTreeNode() {
        $parent  = new TreeNode();
        $child1Data = array(
        	'id'                => '6',
        	'last_changeset_id' => '12345',
        	'title'             => 'As a user I want to search on shared fields',
        	'artifactlinks'     => '8',
        );
        
        $child1 = new TreeNode($child1Data);
        $child1->setId($child1Data['id']);
        
        $child2Data = array(
        	'id'                => '8',
        	'last_changeset_id' => '56789',
        	'title'             => 'Add the form',
        	'artifactlinks'     => '',
        );
        $child2 = new TreeNode($child2Data);
        $child2->setId($child2Data['id']);
        
        
        $parent->addChild($child1);
        $child1->addChild($child2);
        return $parent;
    }
    
    /**
     * 
     */
    public function itShouldSetDataToFirstChildThatMatches_IndentLast_leftTreeIndentMinus_treeAndChild() {
        $given = $this->given_AParentWithOneChildTreeNode();
        $this->when_VisitTreeNodeWith_InjectSpanPadding($given);
        
        $pattern = '%^(.*)'.$this->getPatternSuite("_indent_lastLeft_tree_indent_minusTree").'$%ism';
        $givenChild = $given->getChild(0);
        
        $this->then_GivenTreeNodeData_TreePadding_AssertPattern($givenChild, $pattern);
        $this->then_GivenTreeNodeData_ContentTemplate_AssertPattern($givenChild, '%^(.*)'.$this->getPatternSuite("_child").'$%ism');
    }
    
    /**
     * 
     */
    public function itShouldSetDataToSecondChildThatMatches_BlankBlankLast_LeftLast_Right() {
        $given      = $this->given_AParentWithOneChildTreeNode();
        $this->when_VisitTreeNodeWith_InjectSpanPadding($given);
        
        $pattern    = '%^(.*)'.$this->getPatternSuite("_blank_blank_lastLeft_lastRight").'$%ism';
        $givenChild = $given->getChild(0)->getChild(0);
        
        $this->then_GivenTreeNodeData_TreePadding_AssertPattern($givenChild, $pattern);
    }
}
?>